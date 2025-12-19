// src/controllers/user.controller.ts
import { Request, Response } from "express";
import {
  getAllUsers,
  createUser as createUserService,
} from "../services/user.service.js";
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../types/response.types.js";
import { CreateUserRequest, UserResponse } from "../types/user.types.js";

/**
 * Get all users
 * GET /api/users
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();

    const response: ApiSuccessResponse<UserResponse[]> = {
      success: true,
      data: users,
    };

    res.json(response);
  } catch (error) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Failed to retrieve users",
    };

    res.status(500).json(response);
  }
};

/**
 * Create a new user
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body;

    const result = await createUserService(userData);

    if (!result.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: result.error || "Failed to create user",
      };

      const statusCode = result.error === "Email already exists" ? 409 : 500;
      res.status(statusCode).json(response);
      return;
    }

    const response: ApiSuccessResponse<UserResponse> = {
      success: true,
      data: result.user,
      message: "User created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Failed to create user",
    };

    res.status(500).json(response);
  }
};
