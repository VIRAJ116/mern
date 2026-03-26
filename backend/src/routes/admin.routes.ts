import { Router } from 'express'
import pizzaRoutes from './pizza.routes.ts'

const router = Router()

// POST /api/admin/pizzas - Add a new pizza
router.use('/pizzas', pizzaRoutes)

export default router
