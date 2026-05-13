// src/services/user.service.ts
import { db } from '@/db/index.ts'
import { users, userRoles, roles } from '@/db/schema.ts'
import { eq } from 'drizzle-orm'
import { hashPassword } from './auth.service.ts'
import crypto from 'crypto'
import {
  CreateUserRequest,
  UserResponse,
  CreateUserResult,
  UpdateUserRequest,
} from '../types/user.types.js'
import { log } from '../utils/logger.js'

/**
 * Get all users (excluding passwords)
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)

    // Fetch roles for all users
    const userRoleLinks = await db
      .select({
        userId: userRoles.userId,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))

    const roleMap = new Map<string, string[]>()
    userRoleLinks.forEach((link) => {
      if (!roleMap.has(link.userId)) roleMap.set(link.userId, [])
      roleMap.get(link.userId)!.push(link.roleName)
    })

    const formattedUsers = allUsers.map((user) => ({
      ...user,
      role: roleMap.get(user.id) || ['user'],
    }))

    log.success(`Retrieved ${formattedUsers.length} users`)
    return formattedUsers as any[]
  } catch (error) {
    log.failure('Failed to retrieve users', { error })
    throw new Error('Failed to retrieve users from database')
  }
}

/**
 * Get user by email
 */
export const getUserByEmail = async (
  email: string
): Promise<UserResponse | null> => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (result.length === 0) return null
    const user = result[0]

    const userRoleLinks = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))

    return {
      ...user,
      role: userRoleLinks.map((r) => r.roleName),
    } as any
  } catch (error) {
    log.error('Failed to get user by email', { error, email })
    throw new Error('Failed to retrieve user')
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<UserResponse | null> => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (result.length === 0) return null
    const user = result[0]

    const userRoleLinks = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))

    return {
      ...user,
      role: userRoleLinks.map((r) => r.roleName),
    } as any
  } catch (error) {
    log.error('Failed to get user by ID', { error, id })
    throw new Error('Failed to retrieve user')
  }
}

/**
 * Create a new user
 */
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResult> => {
  try {
    const { name, email, password, roleIds } = userData

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      log.warn('Duplicate email attempt', { email })
      return {
        success: false,
        error: 'Email already exists',
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Let's generate ID manually to insert userRoles safely
    const userId = crypto.randomUUID()
    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
    })

    // Assign roles
    if (roleIds && roleIds.length > 0) {
      await db.insert(userRoles).values(
        roleIds.map((roleId) => ({
          userId,
          roleId,
        }))
      )
    } else {
      const [roleObj] = await db.select().from(roles).where(eq(roles.name, 'user'))
      if (roleObj) {
        await db.insert(userRoles).values({
          userId,
          roleId: roleObj.id,
        })
      }
    }

    log.success(`Created new user: ${email}`)

    // Retrieve the created user
    const newUser = await getUserByEmail(email)

    return {
      success: true,
      user: newUser!,
    }
  } catch (error: any) {
    log.failure('Failed to create user', { error })
    return {
      success: false,
      error: 'Failed to create user',
    }
  }
}

/**
 * Update user roles
 */
export const updateUserRoles = async (userId: string, roleIds: string[]) => {
  try {
    await db.transaction(async (tx) => {
      // Clear existing roles
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));

      // Insert new roles
      if (roleIds.length > 0) {
        await tx.insert(userRoles).values(
          roleIds.map((roleId) => ({
            userId,
            roleId,
          }))
        );
      }
    });

    return { success: true };
  } catch (error) {
    log.error('Failed to update user roles', { error });
    return { success: false, error: 'Failed to update user roles' };
  }
}

/**
 * Update user details
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<CreateUserResult> => {
  try {
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.email) {
      // Check if email belongs to someone else
      const existingUser = await getUserByEmail(data.email)
      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: 'Email already exists' }
      }
      updateData.email = data.email
    }
    if (data.password) {
      updateData.password = await hashPassword(data.password)
    }

    await db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.update(users).set(updateData).where(eq(users.id, userId))
      }

      if (data.roleIds) {
        // Clear existing roles
        await tx.delete(userRoles).where(eq(userRoles.userId, userId));
        
        // Insert new roles
        if (data.roleIds.length > 0) {
          await tx.insert(userRoles).values(
            data.roleIds.map((roleId) => ({
              userId,
              roleId,
            }))
          );
        }
      }
    })

    const updatedUser = await getUserById(userId)
    return { success: true, user: updatedUser! }
  } catch (error: any) {
    log.failure('Failed to update user', { error })
    return { success: false, error: 'Failed to update user' }
  }
}
