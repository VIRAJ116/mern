import { Role } from "@/types/auth.types.ts";
import { Permission } from "@/types/permission.types.ts";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.REPORT_VIEW,
  ],
  [Role.USER]: [Permission.PROFILE_READ, Permission.USER_READ],
};
