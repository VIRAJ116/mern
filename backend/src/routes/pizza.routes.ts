import { Router } from 'express'
import { getPizzas } from '@/controllers/pizza.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'

const router = Router()

// POST /api/admin/pizzas - Add a new pizza in in admin route

// GET /api/pizzas - Public pizza listing
router.get(
  '/',
  authenticate,
  authorizePermission(Permission.PIZZA_READ),
  getPizzas
)

export default router
