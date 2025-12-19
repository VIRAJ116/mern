import { Role } from "@/types/auth.types.ts";
import { Permission } from "@/types/permission.types.ts";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

interface TokenPayload {
  userId: string;
  role: Role;
  permissions: Permission[];
}

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
