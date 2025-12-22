// src/routes/user.routes.ts
import { Router } from 'express'
import { authenticate } from '@/middleware/auth.middleware.ts'
// import { authorizePermission } from "@/middleware/permission.middleware.ts";
// import { Permission } from "@/types/permission.types.ts";
import { login, logout } from '@/controllers/auth.controller.ts'

const router = Router()

/**
 * User routes
 */

router.post('/login', login)

router.post('/logout', authenticate, logout)

router.get('/validate-me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  })
})

// POST /api/users - Create a new user
// router.post("/", validateCreateUser, createUser);

export default router
