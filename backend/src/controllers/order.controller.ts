import { NextFunction, Request, Response } from 'express'
import {
  createOrder,
  verifyPaymentSignature,
  cancelOrderService,
  getOrdersService,
  getOrderByIdService,
} from '@/services/order.service.ts'
import {
  CreateOrderRequest,
  RazorpayVerificationRequest,
} from '@/types/order.types.ts'

/**
 * Create a new order
 * POST /api/orders
 */
export const placeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const orderPayload: CreateOrderRequest = { ...req.body, userId }
    const result = await createOrder(orderPayload)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }

    res.status(201).json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
}

/**
 * Verify Razorpay payment
 * POST /api/orders/verify-payment
 */
export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload: RazorpayVerificationRequest = req.body

    if (
      !payload.razorpay_order_id ||
      !payload.razorpay_payment_id ||
      !payload.razorpay_signature
    ) {
      res
        .status(400)
        .json({ success: false, error: 'Missing payment signature components' })
      return
    }

    const result = await verifyPaymentSignature(payload)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }

    res
      .status(200)
      .json({ success: true, message: 'Payment verified successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Cancel an order
 * PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const orderId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const result = await cancelOrderService(orderId, userId)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }

    res
      .status(200)
      .json({ success: true, message: 'Order cancelled successfully' })
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const result = await getOrdersService(userId)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }

    res.status(200).json({ success: true, data: result.data })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId
    const orderId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    const result = await getOrderByIdService(orderId, userId)

    if (!result.success) {
      res.status(404).json({ success: false, error: result.error })
      return
    }

    res.status(200).json({ success: true, data: result.data })
  } catch (error) {
    next(error)
  }
}
