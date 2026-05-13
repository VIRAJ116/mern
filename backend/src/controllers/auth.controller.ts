// src/controllers/auth.controller.ts
import { issueAuthTokens, verifyPassword } from '@/services/auth.service.ts'
import { getUserByEmail, getUserById } from '@/services/user.service.ts'
import { User } from '@/types/user.types.ts'
import { verifyRefreshToken } from '@/utils/jwt.ts'
import { NextFunction, Request, Response } from 'express'

const REFRESH_COOKIE_NAME = 'refresh_token'
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_COOKIE_MAX_AGE,
}

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

    const { accessToken, refreshToken, roles } = await issueAuthTokens(user.id)

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions)

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roles,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Refresh access token using refresh token cookie (rotation)
 * POST /refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME]
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: 'Refresh token missing' })
    }

    let decoded
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions)
      return res
        .status(401)
        .json({ success: false, error: 'Invalid or expired refresh token' })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions)
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    const { accessToken, refreshToken: newRefreshToken, roles } = await issueAuthTokens(user.id)

    // Rotate refresh cookie
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions)

    res.status(200).json({
      success: true,
      accessToken,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roles,
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
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions)
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}
