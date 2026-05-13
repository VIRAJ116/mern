import { Role } from '@/types/auth.types.ts'
import { Permission } from '@/types/permission.types.ts'
import jwt, { Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import { StringValue } from 'ms'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'secret'

const JWT_EXPIRES_IN: StringValue =
  (process.env.JWT_EXPIRES_IN as StringValue) || '15m'

const REFRESH_SECRET: Secret =
  process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`

const REFRESH_EXPIRES_IN: StringValue =
  (process.env.JWT_REFRESH_EXPIRES_IN as StringValue) || '7d'

export interface AccessTokenPayload {
  userId: string
  role: string | string[]
  permissions: string[]
}

export interface RefreshTokenPayload {
  userId: string
  role: string | string[]
  jti: string
}

export const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload
}

export const generateRefreshToken = (payload: {
  userId: string
  role: string | string[]
}) => {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  })
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload
}

// Backwards-compatible aliases
export const generateToken = generateAccessToken
export const verifyToken = verifyAccessToken
