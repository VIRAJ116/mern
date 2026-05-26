// src/routes/ai.routes.ts
import { Router } from 'express'
import {
  chatController,
  chatStreamController,
} from '@/controllers/ai.controller.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'

const router = Router()

router.post('/', chatController)
router.post('/stream', chatStreamController)

export default router
