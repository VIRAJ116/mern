import { Router } from 'express'
import { placeOrder, verifyPayment, cancelOrder, getOrders, getOrderById } from '@/controllers/order.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'

const router = Router()

// All order routes require authentication
router.use(authenticate)

router.post('/', placeOrder)
router.post('/verify-payment', verifyPayment)
router.patch('/:id/cancel', cancelOrder)
router.get('/me', getOrders)
router.get('/:id', getOrderById)

export default router
