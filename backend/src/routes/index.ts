// src/routes/index.ts
import { Router } from 'express'
import userRoutes from '@/routes/user.routes.ts'
import authRoutes from '@/routes/auth.routes.ts'
import pizzaRoutes from '@/routes/pizza.routes.ts'
import ratingRoutes from '@/routes/rating.routes.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'
import { getCategories } from '@/controllers/pizza.controller.ts'

const router = Router()

/**
 * Central route aggregator
 */

// User routes
router.use(authRoutes)
router.use('/users', userRoutes)
router.use('/pizzas', pizzaRoutes)
router.use('/ratings', ratingRoutes)

// GET /categories - distinct pizza categories
router.get(
  '/categories',
  authenticate,
  authorizePermission(Permission.PIZZA_READ),
  getCategories
)

export default router
