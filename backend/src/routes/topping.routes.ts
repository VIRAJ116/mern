import { Router } from 'express'
import { getToppings } from '@/controllers/topping.controller.ts'

const router = Router()

// GET /toppings - Public toppings listing
router.get('/', getToppings)

export default router
