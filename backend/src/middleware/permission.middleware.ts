import { Permission } from "@/types/permission.types.ts";
import { Request, Response, NextFunction } from "express";

export const authorizePermission =
  (...requiredPermissions: Permission[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }
    const hasPermission = requiredPermissions.every((permission) =>
      req.user!.permissions.includes(permission)
    );
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }
    next();
  };
