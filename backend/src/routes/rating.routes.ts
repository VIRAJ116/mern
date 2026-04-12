import { Router } from 'express'
import { addOrUpdateRating } from '@/controllers/rating.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'

const router = Router()

// POST /api/ratings - Rate a pizza
router.post('/', authenticate, addOrUpdateRating)

export default router
