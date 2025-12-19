// src/controllers/health.controller.ts
import { loginUser, verifyPassword } from "@/services/auth.service.ts";
import { getUserByEmail } from "@/services/user.service.ts";
import { User } from "@/types/user.types.ts";
import { Request, Response } from "express";

/**
 * Get health status
 * GET /health
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = (await getUserByEmail(email)) as User;
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: "Invalid password",
    });
  }
  const token = await loginUser({ id: user.id, role: user.role });
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.status(200).json({
    success: true,
    data: token,
  });
};
