import bcrypt from "bcryptjs";
import { ROLE_PERMISSIONS } from "@/config/role-permissions.ts";
import { Role } from "@/types/auth.types.ts";
import { generateToken } from "@/utils/jwt.ts";

/**
 * Hash password using SHA-256
 * TODO: Replace with bcrypt or argon2 in production
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const loginUser = async (user: { id: string; role: Role }) => {
  const permissions = ROLE_PERMISSIONS[user.role];
  const accessToken = generateToken({
    userId: user.id,
    role: user.role,
    permissions,
  });
  return { accessToken };
};
