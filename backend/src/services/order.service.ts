import { db } from '@/db/index.ts'
import { orders, orderItems, pizzas, toppings } from '@/db/schema.ts'
import {
  CreateOrderRequest,
  RazorpayVerificationRequest,
} from '@/types/order.types.ts'
import { inArray, eq } from 'drizzle-orm'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { log } from '@/utils/logger.ts'

// We initialize inside functions or carefully here to prevent crashes if env is missing
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured in the environment')
  }
  return new Razorpay({ key_id, key_secret })
}

export const createOrder = async (orderData: CreateOrderRequest) => {
  try {
    // 1. Verify Prices (Security)
    const pizzaIds = orderData.items.map((i) => i.pizzaId)
    const allToppingIds = orderData.items.flatMap((i) => i.toppings || [])

    // Query DB for real prices
    const [dbPizzas, dbToppings] = await Promise.all([
      db.select().from(pizzas).where(inArray(pizzas.id, pizzaIds)),
      allToppingIds.length > 0
        ? db.select().from(toppings).where(inArray(toppings.id, allToppingIds))
        : Promise.resolve([]),
    ])

    // Strict validation and calculation
    const SIZE_MULTIPLIERS: Record<string, number> = {
      small: 0.75,
      medium: 1.0,
      large: 1.35,
    }

    const CRUST_EXTRA: Record<string, number> = {
      stuffed: 69,
    }

    let calculatedSubtotal = 0
    const pizzaMap = new Map(dbPizzas.map((p) => [p.id, Number(p.price)]))
    const toppingMap = new Map(dbToppings.map((t) => [t.id, Number(t.price)]))

    for (const item of orderData.items) {
      const basePrice = pizzaMap.get(item.pizzaId)
      if (basePrice === undefined) {
        return {
          success: false,
          error: `Invalid item: Pizza with ID ${item.pizzaId} not found`,
        }
      }

      const sizeMultiplier = SIZE_MULTIPLIERS[item.size] || 1.0
      const crustExtra = CRUST_EXTRA[item.crust] || 0

      let toppingsTotal = 0
      if (item.toppings) {
        for (const toppingId of item.toppings) {
          const toppingPrice = toppingMap.get(toppingId)
          if (toppingPrice === undefined) {
            return {
              success: false,
              error: `Invalid item: Topping with ID ${toppingId} not found`,
            }
          }
          toppingsTotal += toppingPrice
        }
      }

      const unitPrice =
        Math.round(basePrice * sizeMultiplier) + crustExtra + toppingsTotal
      calculatedSubtotal += unitPrice * item.quantity
    }

    const calculatedTotal = calculatedSubtotal + orderData.deliveryFee

    // 2. Insert into Database using a Transaction
    const newOrder = await db.transaction(async (tx) => {
      // Create Main Order
      const [orderIdObj] = await tx
        .insert(orders)
        .values({
          userId: orderData.userId,
          subtotal: calculatedSubtotal.toString(),
          deliveryFee: orderData.deliveryFee.toString(),
          totalAmount: calculatedTotal.toString(),
          status: 'pending',
          paymentMethod: orderData.paymentMethod,
          paymentStatus: 'pending',
          deliveryAddress:
            typeof orderData.deliveryAddress === 'string'
              ? orderData.deliveryAddress
              : JSON.stringify(orderData.deliveryAddress),
        })
        .$returningId()

      const orderId = orderIdObj.id

      // Create Order Items
      const itemsToInsert = orderData.items.map((item) => ({
        orderId,
        pizzaId: item.pizzaId,
        size: item.size,
        crust: item.crust,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        toppings: item.toppings ? JSON.stringify(item.toppings) : null,
      }))

      await tx.insert(orderItems).values(itemsToInsert)

      return { id: orderId, totalAmount: calculatedTotal }
    })

    // 3. Handle Razorpay for Online Payments
    if (orderData.paymentMethod === 'online') {
      const razorpay = getRazorpayInstance()

      // Amount is in paisa (smallest currency unit), so multiply by 100 for INR
      const options = {
        amount: Math.round(newOrder.totalAmount * 100),
        currency: 'INR',
        receipt: newOrder.id, // Must be <= 40 chars. UUID is 36 chars.
      }

      const rpOrder = await razorpay.orders.create(options)

      // Update our DB with the Razorpay Order ID
      await db
        .update(orders)
        .set({ razorpayOrderId: rpOrder.id })
        .where(eq(orders.id, newOrder.id))

      return {
        success: true,
        orderId: newOrder.id,
        paymentMethod: 'online',
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount, // in paisa
        currency: rpOrder.currency,
      }
    }

    // Cash on Delivery
    return {
      success: true,
      orderId: newOrder.id,
      paymentMethod: 'cod',
    }
  } catch (error) {
    log.error('Error creating order in service', { error })
    return { success: false, error: 'Failed to create order' }
  }
}

export const verifyPaymentSignature = async (
  verificationData: RazorpayVerificationRequest
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verificationData
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_secret) throw new Error('Razorpay secret is missing')

    const body = razorpay_order_id + '|' + razorpay_payment_id

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      // Signature is valid! Find the order and update its status
      await db
        .update(orders)
        .set({ paymentStatus: 'completed' })
        .where(eq(orders.razorpayOrderId, razorpay_order_id))

      return { success: true }
    } else {
      return { success: false, error: 'Invalid Payment Signature' }
    }
  } catch (error) {
    log.error('Payment verification failed', { error })
    return { success: false, error: 'Payment verification failed' }
  }
}
