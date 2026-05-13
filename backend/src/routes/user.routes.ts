// src/routes/user.routes.ts
import { Router } from 'express'
import { getUsers, createUser, updateUserRoles, updateUser } from '@/controllers/user.controller.ts'
import { validateCreateUser } from '@/middleware/validation.middleware.ts'
import { authenticate } from '@/middleware/auth.middleware.ts'
import { authorizePermission } from '@/middleware/permission.middleware.ts'
import { Permission } from '@/types/permission.types.ts'

const router = Router()

/**
 * User routes
 */

// Public signup (forces 'user' role internally or ignores roleIds)
router.post('/signup', validateCreateUser, createUser)

// POST /api/users - Create a new user (Admin)
router.post(
  '/',
  authenticate,
  authorizePermission(Permission.USER_CREATE),
  validateCreateUser,
  createUser
)

// GET /api/users - Get all users
router.get(
  '/',
  authenticate,
  authorizePermission(Permission.USER_READ),
  getUsers
)

// PATCH /api/users/:id/roles - Update user roles
router.patch(
  '/:id/roles',
  authenticate,
  authorizePermission(Permission.USER_UPDATE),
  updateUserRoles
)

// PUT /api/users/:id - Update user details
router.put(
  '/:id',
  authenticate,
  authorizePermission(Permission.USER_UPDATE),
  updateUser
)

export default router
