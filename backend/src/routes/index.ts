// src/routes/index.ts
import { Router } from 'express'
import userRoutes from '@/routes/user.routes.ts'
import authRoutes from '@/routes/auth.routes.ts'
import pizzaRoutes from '@/routes/pizza.routes.ts'

const router = Router()

/**
 * Central route aggregator
 */

// User routes
router.use(authRoutes)
router.use('/users', userRoutes)
router.use('/pizzas', pizzaRoutes)

export default router
