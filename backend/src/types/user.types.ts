// src/types/user.types.ts

import { Role } from "./auth.types.ts";

/**
 * User role types
 */
export type UserRole = Role;

/**
 * User entity from database
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

/**
 * User data without sensitive information (for API responses)
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

/**
 * Create user request payload
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User service return type
 */
export interface CreateUserResult {
  success: boolean;
  user?: UserResponse;
  error?: string;
}
