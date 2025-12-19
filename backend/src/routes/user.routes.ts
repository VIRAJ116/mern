// src/routes/user.routes.ts
import { Router } from "express";
import { getUsers, createUser } from "@/controllers/user.controller.ts";
import { validateCreateUser } from "@/middleware/validation.middleware.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { authorizePermission } from "@/middleware/permission.middleware.ts";
import { Permission } from "@/types/permission.types.ts";

const router = Router();

/**
 * User routes
 */

router.post("/signup", validateCreateUser, createUser);

// GET /api/users - Get all users
router.get(
  "/",
  authenticate,
  authorizePermission(Permission.USER_READ),
  getUsers
);

// POST /api/users - Create a new user
// router.post("/", validateCreateUser, createUser);

export default router;
