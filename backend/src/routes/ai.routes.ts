// src/routes/ai.routes.ts
import { Router } from 'express'
import {
  chatController,
  chatStreamController,
} from '@/controllers/ai.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'

const router = Router()

router.post('/', authenticate, chatController)
router.post('/stream', authenticate, chatStreamController)

export default router
