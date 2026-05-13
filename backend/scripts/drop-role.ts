import { db } from '../src/db/index.ts'
import { sql } from 'drizzle-orm'

async function drop() {
  try {
    await db.execute(sql`ALTER TABLE \`users\` DROP COLUMN \`role\`;`)
    console.log('Column dropped')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

drop()
