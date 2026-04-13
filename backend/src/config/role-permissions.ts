import { Role } from "@/types/auth.types.ts";
import { Permission } from "@/types/permission.types.ts";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // All user permissions
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    // All pizza permissions
    Permission.PIZZA_CREATE,
    Permission.PIZZA_READ,
    Permission.PIZZA_UPDATE,
    Permission.PIZZA_DELETE,
    // All topping permissions
    Permission.TOPPING_CREATE,
    Permission.TOPPING_READ,
    Permission.TOPPING_UPDATE,
    Permission.TOPPING_DELETE,
    // All category permissions
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    // Other
    Permission.PROFILE_READ,
    Permission.REPORT_VIEW,
  ],
  [Role.ADMIN]: [
    // User management
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    // All pizza permissions
    Permission.PIZZA_CREATE,
    Permission.PIZZA_READ,
    Permission.PIZZA_UPDATE,
    Permission.PIZZA_DELETE,
    // All topping permissions
    Permission.TOPPING_CREATE,
    Permission.TOPPING_READ,
    Permission.TOPPING_UPDATE,
    Permission.TOPPING_DELETE,
    // All category permissions
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.CATEGORY_DELETE,
    // Other
    Permission.PROFILE_READ,
    Permission.REPORT_VIEW,
  ],
  [Role.USER]: [
    Permission.PROFILE_READ,
    Permission.USER_READ,
    // Users can only view pizzas
    Permission.PIZZA_READ,
    // Users can only view toppings (via public endpoint, but permission tracked)
    Permission.TOPPING_READ,
    // Users can view categories
    Permission.CATEGORY_READ,
  ],
};

