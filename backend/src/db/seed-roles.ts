// src/db/seed-roles.ts
import "dotenv/config";
import { db } from "./index.js";
import { roles, rolePermissions } from "./schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * All available permissions in the system.
 * Sourced from: src/types/permission.types.ts
 */
const ALL_PERMISSIONS = [
  // User management
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  // Profile
  "profile:read",
  "report:view",
  // Pizza
  "pizza:create",
  "pizza:read",
  "pizza:update",
  "pizza:delete",
  // Toppings
  "topping:create",
  "topping:read",
  "topping:update",
  "topping:delete",
  // Categories
  "category:create",
  "category:read",
  "category:update",
  "category:delete",
  // Orders
  "order:read",
  "order:update",
] as const;

/**
 * Role definitions with their permissions.
 * - super_admin: Full access to everything (system role, cannot be deleted).
 * - admin: Can manage content (pizzas, toppings, categories, orders) but not users/roles.
 * - user: Regular customer with no admin permissions.
 */
const ROLE_DEFINITIONS = [
  {
    name: "super_admin",
    description: "Full system access. Can manage users, roles, and all content.",
    isSystem: true,
    permissions: [...ALL_PERMISSIONS],
  },
  {
    name: "admin",
    description: "Can manage pizzas, toppings, categories, and orders.",
    isSystem: true,
    permissions: [
      "profile:read",
      "report:view",
      "pizza:create",
      "pizza:read",
      "pizza:update",
      "pizza:delete",
      "topping:create",
      "topping:read",
      "topping:update",
      "topping:delete",
      "category:create",
      "category:read",
      "category:update",
      "category:delete",
      "order:read",
      "order:update",
    ],
  },
  {
    name: "user",
    description: "Regular customer. No admin permissions.",
    isSystem: false,
    permissions: ["profile:read"],
  },
];

async function seedRoles() {
  try {
    console.log("🌱 Starting roles seeding...");

    for (const roleDef of ROLE_DEFINITIONS) {
      // Check if role already exists
      const [existing] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleDef.name));

      if (existing) {
        console.log(`⚠️  Role "${roleDef.name}" already exists. Skipping...`);
        continue;
      }

      const roleId = crypto.randomUUID();

      // Insert the role
      await db.insert(roles).values({
        id: roleId,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      });

      // Insert permissions for this role
      if (roleDef.permissions.length > 0) {
        await db.insert(rolePermissions).values(
          roleDef.permissions.map((p) => ({
            roleId,
            permission: p,
          }))
        );
      }

      console.log(
        `✅ Role "${roleDef.name}" created with ${roleDef.permissions.length} permissions.`
      );
    }
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    throw error;
  }
}

// Run
seedRoles()
  .then(() => {
    console.log("🎉 Roles seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Roles seeding failed:", error);
    process.exit(1);
  });
