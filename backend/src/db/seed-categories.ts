// src/db/seed-categories.ts
import 'dotenv/config'
import { db } from './index.js'
import { categories } from './schema.js'
import { count } from 'drizzle-orm'

const CATEGORIES_DATA = [
  { name: 'Veg', slug: 'veg' },
  { name: 'Non-Veg', slug: 'non-veg' },
  { name: 'Special', slug: 'special' },
]

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...')

    const [{ total }] = await db.select({ total: count() }).from(categories)
    if (Number(total) > 0) {
      console.log(`⚠️  Categories already seeded (${total} rows). Skipping.`)
      return
    }

    await db.insert(categories).values(
      CATEGORIES_DATA.map((c) => ({
        id: crypto.randomUUID(),
        name: c.name,
        slug: c.slug,
      }))
    )

    console.log(`✅ Inserted ${CATEGORIES_DATA.length} categories.`)
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  }
}

seedCategories()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch(() => process.exit(1))
