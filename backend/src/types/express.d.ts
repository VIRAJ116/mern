import { Role } from "./auth.types.ts";
import { Permission } from "./permission.types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
        permissions: Permission[];
      };
    }
  }
}
