import { Request, Response, NextFunction } from 'express'
import {
  getRolesService,
  createRoleService,
  updateRoleService,
  deleteRoleService,
} from '@/services/role.service.ts'
import { Permission } from '@/types/permission.types.ts'

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getRolesService()
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' })
    }
    const result = await createRoleService({ name, description, permissions: permissions || [] })
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, permissions } = req.body
    const result = await updateRoleService(id, { name, description, permissions })
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const result = await deleteRoleService(id)
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = Object.values(Permission)
    res.status(200).json({ success: true, data: permissions })
  } catch (error) {
    next(error)
  }
}
