import bcrypt from "bcryptjs";
import { db } from "@/db/index.ts";
import { roles, rolePermissions, userRoles } from "@/db/schema.ts";
import { eq, inArray } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/jwt.ts";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const issueAuthTokens = async (userId: string) => {
  const uRoles = await db
    .select({ roleId: userRoles.roleId, roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  const roleIds = uRoles.map(ur => ur.roleId);
  const roleNames = uRoles.map(ur => ur.roleName);

  let permissionsList: string[] = [];
  
  if (roleIds.length > 0) {
    const rPerms = await db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));
    
    permissionsList = [...new Set(rPerms.map(rp => rp.permission))];
  }

  // Fallback to 'user' string if no role assigned
  const rolesToAssign = roleNames.length > 0 ? roleNames : ['user'];

  const accessToken = generateAccessToken({
    userId,
    role: rolesToAssign,
    permissions: permissionsList,
  });
  const refreshToken = generateRefreshToken({
    userId,
    role: rolesToAssign,
  });
  return { accessToken, refreshToken, roles: rolesToAssign };
};

// Backwards-compatible alias
export const loginUser = issueAuthTokens;
