import { Router } from 'express'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'
import { addPizza, getPizza, removePizza, updatePizza } from '@/controllers/pizza.controller.ts'

const router = Router()

// POST /api/admin/pizzas - Add a new pizza
router.post(
  '/pizzas',
  authenticate,
  authorizePermission(Permission.PIZZA_CREATE),
  addPizza
)

// GET /api/admin/pizzas/:id - Get a single pizza
router.get(
  '/pizzas/:id',
  authenticate,
  authorizePermission(Permission.PIZZA_READ),
  getPizza
)

// PATCH /api/admin/pizzas/:id - Update a pizza
router.patch(
  '/pizzas/:id',
  authenticate,
  authorizePermission(Permission.PIZZA_UPDATE),
  updatePizza
)

// DELETE /api/admin/pizzas/:id - Delete a pizza
router.delete(
  '/pizzas/:id',
  authenticate,
  authorizePermission(Permission.PIZZA_DELETE),
  removePizza
)

export default router
