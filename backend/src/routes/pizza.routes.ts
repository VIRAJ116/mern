import { Router } from 'express'
import { getFanFavouritesController, getPizza, getPizzas } from '@/controllers/pizza.controller.ts'

const router = Router()

// GET /pizzas - Public pizza listing
router.get('/', getPizzas)

// GET /pizzas/fan-favourites - Top rated pizzas (must be before /:id)
router.get('/fan-favourites', getFanFavouritesController)

// GET /pizzas/:id - Get single pizza by ID (public)
router.get('/:id', getPizza)

export default router
