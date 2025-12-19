// src/services/user.service.ts
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.service.ts";
import {
  CreateUserRequest,
  UserResponse,
  CreateUserResult,
} from "../types/user.types.js";
import { log } from "../utils/logger.js";

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
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);

    log.success(`Retrieved ${allUsers.length} users`);
    return allUsers as UserResponse[];
  } catch (error) {
    log.failure("Failed to retrieve users", { error });
    throw new Error("Failed to retrieve users from database");
  }
};

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
        role: users.role,
        createdAt: users.createdAt,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? (result[0] as UserResponse) : null;
  } catch (error) {
    log.error("Failed to get user by email", { error, email });
    throw new Error("Failed to retrieve user");
  }
};

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
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as UserResponse) : null;
  } catch (error) {
    log.error("Failed to get user by ID", { error, id });
    throw new Error("Failed to retrieve user");
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResult> => {
  try {
    const { name, email, password, role = "user" } = userData;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      log.warn("Duplicate email attempt", { email });
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
    });

    log.success(`Created new user: ${email}`);

    // Retrieve the created user
    const newUser = await getUserByEmail(email);

    return {
      success: true,
      user: newUser!,
    };
  } catch (error: any) {
    log.failure("Failed to create user", { error });
    return {
      success: false,
      error: "Failed to create user",
    };
  }
};
