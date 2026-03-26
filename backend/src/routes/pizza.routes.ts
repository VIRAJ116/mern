import { Router } from 'express'
import { addPizza } from '@/controllers/pizza.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'

const router = Router()

// POST /api/admin/pizzas - Add a new pizza
router.post(
  '/pizzas',
  authenticate,
  authorizePermission(Permission.PIZZA_CREATE),
  addPizza
)

export default router
