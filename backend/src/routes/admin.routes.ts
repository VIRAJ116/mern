import { Router } from 'express'
import pizzaRoutes from './pizza.routes.ts'

const router = Router()

router.use(pizzaRoutes)

export default router
