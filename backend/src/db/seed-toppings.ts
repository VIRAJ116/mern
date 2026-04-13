// src/db/seed-toppings.ts
import 'dotenv/config'
import { db } from './index.js'
import { toppings } from './schema.js'
import { count } from 'drizzle-orm'

const TOPPINGS_DATA = [
  { name: 'Extra Cheese', price: '49.00', icon: '🧀' },
  { name: 'Mushrooms', price: '39.00', icon: '🍄' },
  { name: 'Jalapeños', price: '29.00', icon: '🌶️' },
  { name: 'Sweet Corn', price: '29.00', icon: '🌽' },
  { name: 'Black Olives', price: '39.00', icon: '🫒' },
  { name: 'Chicken Strips', price: '79.00', icon: '🍗' },
  { name: 'Bacon Bits', price: '89.00', icon: '🥓' },
  { name: 'Bell Peppers', price: '29.00', icon: '🫑' },
  { name: 'Onions', price: '19.00', icon: '🧅' },
  { name: 'Pineapple', price: '39.00', icon: '🍍' },
]

async function seedToppings() {
  try {
    console.log('🌱 Seeding toppings...')

    const [{ total }] = await db.select({ total: count() }).from(toppings)
    if (Number(total) > 0) {
      console.log(`⚠️  Toppings already seeded (${total} rows). Skipping.`)
      return
    }

    await db.insert(toppings).values(
      TOPPINGS_DATA.map((t) => ({
        id: crypto.randomUUID(),
        name: t.name,
        price: t.price,
        icon: t.icon,
        isAvailable: true,
      }))
    )

    console.log(`✅ Inserted ${TOPPINGS_DATA.length} toppings.`)
  } catch (error) {
    console.error('❌ Error seeding toppings:', error)
    throw error
  }
}

seedToppings()
  .then(() => {
    console.log('🎉 Done!')
    process.exit(0)
  })
  .catch(() => process.exit(1))
