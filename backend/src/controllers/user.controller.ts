// src/controllers/user.controller.ts
import { NextFunction, Request, Response } from 'express'
import {
  getAllUsers,
  createUser as createUserService,
  updateUserRoles as updateUserRolesService,
  updateUser as updateUserService,
} from '../services/user.service.ts'
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../types/response.types.ts'
import { CreateUserRequest, UserResponse } from '../types/user.types.ts'

/**
 * Get all users
 * GET /api/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await getAllUsers()
    const response: ApiSuccessResponse<UserResponse[]> = {
      success: true,
      data: users,
    }
    res.json(response)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new user
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body
    
    // Security: Ensure public signup cannot inject roles
    if (req.path === '/signup') {
      delete userData.roleIds
    }

    const result = await createUserService(userData)

    if (!result.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: result.error || 'Failed to create user',
      }
      const statusCode = result.error === 'Email already exists' ? 409 : 500
      res.status(statusCode).json(response)
      return
    }

    const response: ApiSuccessResponse<UserResponse> = {
      success: true,
      data: result.user,
      message: 'User created successfully',
    }
    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
}

export const updateUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { roleIds } = req.body
    if (!roleIds || !Array.isArray(roleIds)) {
      res.status(400).json({ success: false, error: 'roleIds array is required' })
      return
    }

    const result = await updateUserRolesService(id, roleIds)
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const updateData = req.body

    const result = await updateUserService(id, updateData)

    if (!result.success) {
      const statusCode = result.error === 'Email already exists' ? 409 : 400
      res.status(statusCode).json(result)
      return
    }

    const response: ApiSuccessResponse<UserResponse> = {
      success: true,
      data: result.user,
      message: 'User updated successfully',
    }
    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}
