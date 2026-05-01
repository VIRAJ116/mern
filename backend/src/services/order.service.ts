import { db } from '@/db/index.ts'
import { orders, orderItems, pizzas, toppings, users } from '@/db/schema.ts'
import {
  CreateOrderRequest,
  RazorpayVerificationRequest,
  GetOrdersResponse,
  GetOrderByIdResponse,
} from '@/types/order.types.ts'
import { inArray, eq, and, desc, count, like } from 'drizzle-orm'
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

export const cancelOrderService = async (orderId: string, userId: string) => {
  try {
    await db
      .update(orders)
      .set({ status: 'cancelled', paymentStatus: 'failed' })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, userId),
          eq(orders.status, 'pending')
        )
      )

    return { success: true }
  } catch (error) {
    log.error('Error cancelling order', { error })
    return { success: false, error: 'Failed to cancel order' }
  }
}

export const getOrdersService = async (
  userId: string
): Promise<GetOrdersResponse> => {
  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))

    if (userOrders.length === 0) {
      return { success: true, data: [] }
    }

    const orderIds = userOrders.map((o) => o.id)
    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))

    const pizzaIds = [...new Set(items.map((i) => i.pizzaId))]
    let pizzasData: any[] = []
    if (pizzaIds.length > 0) {
      pizzasData = await db
        .select()
        .from(pizzas)
        .where(inArray(pizzas.id, pizzaIds))
    }
    const pizzaMap = new Map(pizzasData.map((p) => [p.id, p]))

    const formattedOrders = userOrders.map((order) => {
      const orderItemsList = items
        .filter((i) => i.orderId === order.id)
        .map((item) => ({
          name: pizzaMap.get(item.pizzaId)?.name || 'Unknown Pizza',
          qty: Number(item.quantity),
        }))

      return {
        _id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        total: Number(order.totalAmount),
        items: orderItemsList,
      }
    })

    return { success: true, data: formattedOrders }
  } catch (error) {
    log.error('Error fetching orders', { error })
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export const getAllOrdersAdminService = async ({
  page = 1,
  limit = 10,
  status,
  search,
}: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  try {
    const conditions = []
    if (status) conditions.push(eq(orders.status, status))
    if (search) conditions.push(like(orders.id, `%${search}%`))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db
      .select({ total: count() })
      .from(orders)
      .where(whereClause)

    const offset = (page - 1) * limit
    const allOrders = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    if (allOrders.length === 0) {
      return {
        success: true,
        orders: [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      }
    }

    const userIds = [...new Set(allOrders.map((o) => o.userId))]
    const usersData = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(inArray(users.id, userIds))
    const userMap = new Map(usersData.map((u) => [u.id, u]))

    const orderIds = allOrders.map((o) => o.id)
    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))

    const formattedOrders = allOrders.map((order) => {
      const user = userMap.get(order.userId)
      const orderItemsList = items.filter((i) => i.orderId === order.id)
      return {
        _id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        total: Number(order.totalAmount),
        customer: user ? { name: user.name, email: user.email } : null,
        items: orderItemsList,
      }
    })

    return {
      success: true,
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  } catch (error) {
    log.error('Error fetching all orders (admin)', { error })
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export const getOrderByIdAdminService = async (orderId: string) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId))

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const [userInfo] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, order.userId))

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const pizzaIds = [...new Set(items.map((i) => i.pizzaId))]
    let pizzasData: any[] = []
    if (pizzaIds.length > 0) {
      pizzasData = await db
        .select()
        .from(pizzas)
        .where(inArray(pizzas.id, pizzaIds))
    }
    const pizzaMap = new Map(pizzasData.map((p) => [p.id, p]))

    let allToppingIds: string[] = []
    items.forEach((i) => {
      if (i.toppings) {
        try {
          allToppingIds = [...allToppingIds, ...JSON.parse(i.toppings)]
        } catch (e) {}
      }
    })
    const uniqueToppingIds = [...new Set(allToppingIds)]
    let toppingsData: any[] = []
    if (uniqueToppingIds.length > 0) {
      toppingsData = await db
        .select()
        .from(toppings)
        .where(inArray(toppings.id, uniqueToppingIds))
    }
    const toppingMap = new Map(toppingsData.map((t) => [t.id, t.name]))

    const formattedItems = items.map((item) => {
      let itemToppings: string[] = []
      if (item.toppings) {
        try {
          itemToppings = JSON.parse(item.toppings).map(
            (tId: string) => toppingMap.get(tId) || 'Unknown'
          )
        } catch (e) {}
      }
      return {
        id: item.id,
        name: pizzaMap.get(item.pizzaId)?.name || 'Unknown Pizza',
        size: item.size,
        crust: item.crust,
        toppings: itemToppings,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        price: Number(item.unitPrice),
      }
    })

    const formattedOrder = {
      _id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod:
        order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      deliveryAddress:
        typeof order.deliveryAddress === 'string'
          ? JSON.parse(order.deliveryAddress)
          : order.deliveryAddress,
      customer: userInfo
        ? { name: userInfo.name, email: userInfo.email }
        : null,
      items: formattedItems,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.totalAmount),
    }

    return { success: true, data: formattedOrder }
  } catch (error) {
    log.error('Error fetching order by id (admin)', { error })
    return { success: false, error: 'Failed to fetch order' }
  }
}

export const updateOrderStatusAdminService = async (
  orderId: string,
  status: string
) => {
  try {
    const validStatuses = [
      'placed',
      'preparing',
      'out-for-delivery',
      'delivered',
      'cancelled',
    ]
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status' }
    }

    await db
      .update(orders)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, orderId))

    return { success: true }
  } catch (error) {
    log.error('Error updating order status (admin)', { error })
    return { success: false, error: 'Failed to update order status' }
  }
}

export const getOrderByIdService = async (
  orderId: string,
  userId: string
): Promise<GetOrderByIdResponse> => {
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    const pizzaIds = [...new Set(items.map((i) => i.pizzaId))]
    let pizzasData: any[] = []
    if (pizzaIds.length > 0) {
      pizzasData = await db
        .select()
        .from(pizzas)
        .where(inArray(pizzas.id, pizzaIds))
    }
    const pizzaMap = new Map(pizzasData.map((p) => [p.id, p]))

    let allToppingIds: string[] = []
    items.forEach((i) => {
      if (i.toppings) {
        try {
          const tIds = JSON.parse(i.toppings)
          allToppingIds = [...allToppingIds, ...tIds]
        } catch (e) {}
      }
    })
    const uniqueToppingIds = [...new Set(allToppingIds)]
    let toppingsData: any[] = []
    if (uniqueToppingIds.length > 0) {
      toppingsData = await db
        .select()
        .from(toppings)
        .where(inArray(toppings.id, uniqueToppingIds))
    }
    const toppingMap = new Map(toppingsData.map((t) => [t.id, t.name]))

    const formattedItems = items.map((item) => {
      let itemToppings: string[] = []
      if (item.toppings) {
        try {
          const tIds = JSON.parse(item.toppings)
          itemToppings = tIds.map(
            (tId: string) => toppingMap.get(tId) || 'Unknown'
          )
        } catch (e) {}
      }

      return {
        id: item.id,
        name: pizzaMap.get(item.pizzaId)?.name || 'Unknown Pizza',
        size: item.size,
        crust: item.crust,
        toppings: itemToppings,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }
    })

    const formattedOrder = {
      _id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod:
        order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      deliveryAddress:
        typeof order.deliveryAddress === 'string'
          ? JSON.parse(order.deliveryAddress)
          : order.deliveryAddress,
      items: formattedItems,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.totalAmount),
    }

    return { success: true, data: formattedOrder }
  } catch (error) {
    log.error('Error fetching order by id', { error })
    return { success: false, error: 'Failed to fetch order' }
  }
}
