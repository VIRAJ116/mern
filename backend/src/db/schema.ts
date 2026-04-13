// src/db/schema.ts
import {
  mysqlTable,
  char,
  varchar,
  timestamp,
  decimal,
  uniqueIndex,
  boolean,
} from 'drizzle-orm/mysql-core'

// Example: Define a users table
export const users = mysqlTable('users', {
  // Use UUID instead of auto-incrementing integer
  id: char('id', { length: 36 })
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(), // varchar requires a length
  email: varchar('email', { length: 256 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(), // hashed password
  role: varchar('role', { length: 50 }).notNull().default('user'), // user role: 'user', 'admin', 'super_admin'
  // MySQL has different timestamp/datetime types than Postgres
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

export const pizzas = mysqlTable('pizzas', {
  id: char('id', { length: 36 })
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 1000 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  tags: varchar('tags', { length: 256 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default('0'),
  ratingCount: decimal('rating_count', { precision: 10, scale: 0 }).default(
    '0'
  ),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
})

export const ratings = mysqlTable(
  'ratings',
  {
    id: char('id', { length: 36 })
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    userId: char('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    pizzaId: char('pizza_id', { length: 36 })
      .notNull()
      .references(() => pizzas.id, { onDelete: 'cascade' }),
    rating: decimal('rating', { precision: 2, scale: 1 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => ({
    uniqueUserPizza: uniqueIndex('user_pizza_unique').on(
      table.userId,
      table.pizzaId
    ),
  })
)

export const toppings = mysqlTable('toppings', {
  id: char('id', { length: 36 })
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  icon: varchar('icon', { length: 10 }).notNull().default('🍕'),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
})

export const categories = mysqlTable('categories', {
  id: char('id', { length: 36 })
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
})
