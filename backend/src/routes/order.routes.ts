import { Router } from 'express'
import { placeOrder, verifyPayment } from '@/controllers/order.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'

const router = Router()

// All order routes require authentication
router.use(authenticate)

router.post('/', placeOrder)
router.post('/verify-payment', verifyPayment)

export default router
