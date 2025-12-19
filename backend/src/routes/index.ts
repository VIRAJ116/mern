// src/routes/index.ts
import { Router } from "express";
import { getHealth } from "@/controllers/health.controller.ts";
import userRoutes from "@/routes/user.routes.ts";
import authRoutes from "@/routes/auth.routes.ts";

const router = Router();

/**
 * Central route aggregator
 */

// Health check endpoint
router.get("/health", getHealth);

// User routes
router.use(authRoutes);
router.use("/users", userRoutes);

export default router;
