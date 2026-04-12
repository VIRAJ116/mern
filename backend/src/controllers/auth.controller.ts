// src/controllers/auth.controller.ts
import { loginUser, verifyPassword } from '@/services/auth.service.ts'
import { getUserByEmail } from '@/services/user.service.ts'
import { User } from '@/types/user.types.ts'
import { NextFunction, Request, Response } from 'express'

/**
 * Login
 * POST /login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body
    const user = (await getUserByEmail(email)) as User
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid credentials' })
    }
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid password' })
    }
    const { accessToken } = await loginUser({ id: user.id, role: user.role })
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Logout
 * POST /logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}
