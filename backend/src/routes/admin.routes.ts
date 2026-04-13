import { Router } from 'express'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'
import { addPizza, getPizza, removePizza, updatePizza } from '@/controllers/pizza.controller.ts'
import { addTopping, updateToppingById, removeTopping } from '@/controllers/topping.controller.ts'
import { addCategory, updateCategoryById, removeCategory } from '@/controllers/category.controller.ts'

const router = Router()

// ─── Pizza admin routes ───────────────────────────────────────────────────────

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

// ─── Topping admin routes ─────────────────────────────────────────────────────

// POST /api/admin/toppings - Add a new topping
router.post(
  '/toppings',
  authenticate,
  authorizePermission(Permission.TOPPING_CREATE),
  addTopping
)

// PATCH /api/admin/toppings/:id - Update a topping
router.patch(
  '/toppings/:id',
  authenticate,
  authorizePermission(Permission.TOPPING_UPDATE),
  updateToppingById
)

// DELETE /api/admin/toppings/:id - Delete a topping
router.delete(
  '/toppings/:id',
  authenticate,
  authorizePermission(Permission.TOPPING_DELETE),
  removeTopping
)

// ─── Category admin routes ────────────────────────────────────────────────────

// POST /api/admin/categories - Add a category
router.post(
  '/categories',
  authenticate,
  authorizePermission(Permission.CATEGORY_CREATE),
  addCategory
)

// PATCH /api/admin/categories/:id - Update a category
router.patch(
  '/categories/:id',
  authenticate,
  authorizePermission(Permission.CATEGORY_UPDATE),
  updateCategoryById
)

// DELETE /api/admin/categories/:id - Delete a category
router.delete(
  '/categories/:id',
  authenticate,
  authorizePermission(Permission.CATEGORY_DELETE),
  removeCategory
)

export default router

