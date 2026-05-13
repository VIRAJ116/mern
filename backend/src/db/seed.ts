// src/db/seed.ts
import "dotenv/config";
import { db } from "./index.js";
import { users, roles, userRoles } from "./schema.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "../services/auth.service.js";
import crypto from "crypto";

/**
 * Seed the database with a super admin user
 */
async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Super admin credentials
    const superAdminEmail = "admin@example.com";
    const superAdminPassword = "Admin@123"; // Change this in production!
    const superAdminName = "Super Admin";

    // Check if super admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("⚠️  Super admin already exists. Skipping...");
      console.log(`📧 Email: ${superAdminEmail}`);
      return;
    }

    // Create super admin user
    const hashedPassword = await hashPassword(superAdminPassword);

    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      name: superAdminName,
      email: superAdminEmail,
      password: hashedPassword,
    });

    // Assign super_admin role
    const [roleObj] = await db.select().from(roles).where(eq(roles.name, "super_admin"));
    if (roleObj) {
      await db.insert(userRoles).values({
        userId,
        roleId: roleObj.id,
      });
    }

    console.log("✅ Super admin created successfully!");
    console.log("📧 Email:", superAdminEmail);
    console.log("🔑 Password:", superAdminPassword);
    console.log("⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("🎉 Seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
