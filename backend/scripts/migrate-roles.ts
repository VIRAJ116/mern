import { db } from '../src/db/index.ts'
import { roles, rolePermissions, userRoles, users } from '../src/db/schema.ts'
import { ROLE_PERMISSIONS } from '../src/config/role-permissions.ts'
import crypto from 'crypto'
import { sql } from 'drizzle-orm'

async function run() {
  console.log('Migrating roles...')
  try {
    const roleIdMap: Record<string, string> = {}

    // 1. Create Roles and their permissions
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = crypto.randomUUID()
      roleIdMap[roleName] = roleId

      console.log(`Creating role: ${roleName}`)
      await db.insert(roles).values({
        id: roleId,
        name: roleName,
        description: `System default ${roleName} role`,
        isSystem: true,
      })

      const permsToInsert = permissions.map(p => ({
        roleId,
        permission: p
      }))

      if (permsToInsert.length > 0) {
        await db.insert(rolePermissions).values(permsToInsert)
      }
    }

    // 2. Map existing users to user_roles
    // Since we didn't drop the 'role' column yet, we can query it using raw SQL
    const allUsers = await db.execute(sql`SELECT id, role FROM users`)
    
    // Using any because raw query returns RowDataPacket[]
    const usersList = allUsers[0] as any[]

    console.log(`Migrating ${usersList.length} users...`)

    for (const user of usersList) {
      const roleId = roleIdMap[user.role]
      if (roleId) {
        await db.insert(userRoles).values({
          userId: user.id,
          roleId: roleId
        }).onDuplicateKeyUpdate({ set: { roleId } }) // Just in case
      } else {
        console.warn(`User ${user.id} has unknown role ${user.role}`)
        // Default to user role
        if (roleIdMap['user']) {
           await db.insert(userRoles).values({
            userId: user.id,
            roleId: roleIdMap['user']
          }).onDuplicateKeyUpdate({ set: { roleId: roleIdMap['user'] } })
        }
      }
    }

    console.log('Role migration complete!')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed', err)
    process.exit(1)
  }
}

run()
