import { db } from '@/db/index.ts'
import { roles, rolePermissions, userRoles } from '@/db/schema.ts'
import { eq, inArray } from 'drizzle-orm'
import { log } from '@/utils/logger.ts'
import crypto from 'crypto'

export const getRolesService = async () => {
  try {
    const allRoles = await db.select().from(roles).orderBy(roles.createdAt)
    const allPermissions = await db.select().from(rolePermissions)

    const formattedRoles = allRoles.map((role) => {
      const permissions = allPermissions
        .filter((rp) => rp.roleId === role.id)
        .map((rp) => rp.permission)
      return {
        ...role,
        permissions,
      }
    })

    return { success: true, data: formattedRoles }
  } catch (error) {
    log.error('Error fetching roles', { error })
    return { success: false, error: 'Failed to fetch roles' }
  }
}

export const createRoleService = async (data: {
  name: string
  description?: string
  permissions: string[]
}) => {
  try {
    const newRoleId = crypto.randomUUID()
    await db.transaction(async (tx) => {
      await tx.insert(roles).values({
        id: newRoleId,
        name: data.name,
        description: data.description,
      })

      if (data.permissions.length > 0) {
        await tx.insert(rolePermissions).values(
          data.permissions.map((p) => ({
            roleId: newRoleId,
            permission: p,
          }))
        )
      }
    })

    return { success: true, data: { id: newRoleId } }
  } catch (error) {
    log.error('Error creating role', { error })
    return { success: false, error: 'Failed to create role' }
  }
}

export const updateRoleService = async (
  id: string,
  data: {
    name?: string
    description?: string
    permissions?: string[]
  }
) => {
  try {
    await db.transaction(async (tx) => {
      if (data.name || data.description !== undefined) {
        await tx
          .update(roles)
          .set({
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
          })
          .where(eq(roles.id, id))
      }

      if (data.permissions) {
        // Delete old permissions
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id))
        
        // Insert new ones
        if (data.permissions.length > 0) {
          await tx.insert(rolePermissions).values(
            data.permissions.map((p) => ({
              roleId: id,
              permission: p,
            }))
          )
        }
      }
    })

    return { success: true }
  } catch (error) {
    log.error('Error updating role', { error })
    return { success: false, error: 'Failed to update role' }
  }
}

export const deleteRoleService = async (id: string) => {
  try {
    const [role] = await db.select().from(roles).where(eq(roles.id, id))
    if (!role) {
      return { success: false, error: 'Role not found' }
    }
    if (role.isSystem) {
      return { success: false, error: 'Cannot delete system role' }
    }

    await db.delete(roles).where(eq(roles.id, id))
    return { success: true }
  } catch (error) {
    log.error('Error deleting role', { error })
    return { success: false, error: 'Failed to delete role' }
  }
}
