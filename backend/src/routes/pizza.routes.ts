import { Router } from 'express'
import { getPizza, getPizzas } from '@/controllers/pizza.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'

const router = Router()

// POST /api/admin/pizzas - Add a new pizza in admin route

// GET /pizzas - Public pizza listing
router.get('/', getPizzas)

// GET /pizzas/:id - Get single pizza by ID (public)
router.get('/:id', getPizza)

export default router
