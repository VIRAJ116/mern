# Backend API

A Node.js backend API built with Express, Drizzle ORM, and MySQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
DATABASE_URL="mysql://user:password@localhost:3306/your_database"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
LOG_LEVEL="debug"
```

### 3. Generate and Run Migrations

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

### 4. Seed the Database

Create the super admin user:

```bash
npm run db:seed
```

**Default Super Admin Credentials:**

- Email: `admin@example.com`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change the password after first login!

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📝 Available Scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start development server with hot reload     |
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate`  | Apply migrations to database                 |
| `npm run db:seed`     | Seed database with super admin user          |
| `npm run db:studio`   | Open Drizzle Studio (database GUI)           |

## 🗄️ Database Schema

### Users Table

- `id` - Auto-incrementing primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (`user`, `admin`, `super_admin`)
- `createdAt` - Timestamp of creation

## 🔐 User Roles

- **user** - Regular user (default)
- **admin** - Administrator
- **super_admin** - Super administrator with full access

## 🌐 API Endpoints

### Health Check

```
GET /health
```

Returns server status and timestamp.

### Users

```
GET /api/users
```

Get all users (excludes password field).

```
POST /api/users
```

Create a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

## 🛠️ Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Drizzle ORM
- **Logging:** Winston + Chalk
- **CORS:** cors middleware
- **Dev Tools:** tsx (TypeScript execution)

## 📦 Installed Packages

### Production Dependencies

- `express` - Web framework
- `drizzle-orm` - TypeScript ORM
- `mysql2` - MySQL client
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `winston` - Logging library
- `chalk` - Terminal styling

### Development Dependencies

- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `drizzle-kit` - Drizzle CLI tools
- `@types/express` - Express type definitions
- `@types/cors` - CORS type definitions
- `@types/node` - Node.js type definitions

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── cors.config.ts
│   │   └── database.config.ts
│   ├── controllers/         # Request handlers
│   │   ├── health.controller.ts
│   │   └── user.controller.ts
│   ├── db/                  # Database layer
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── middleware/          # Express middleware
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/              # API routes
│   │   ├── index.ts
│   │   └── user.routes.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── types/               # TypeScript types
│   │   ├── response.types.ts
│   │   └── user.types.ts
│   ├── utils/               # Utilities
│   │   └── logger.ts
│   └── index.ts             # App entry point
├── drizzle/                 # Migration files
├── logs/                    # Log files
├── .env                     # Environment variables
├── ARCHITECTURE.md          # Architecture documentation
├── README.md
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

> 📖 **See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation**

## 🔧 Configuration

### CORS

Configure allowed origins in `.env`:

```bash
# Allow all origins (development only)
CORS_ORIGIN="*"

# Allow specific origin (recommended for production)
CORS_ORIGIN="https://yourdomain.com"
```

### Logging

Logs are written to:

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console - Colorized output

Adjust log level in `.env`:

```bash
LOG_LEVEL="debug"  # Options: error, warn, info, debug
```

## 🔒 Security Notes

1. **Password Hashing:** The seed script uses SHA-256 for demonstration. In production, use `bcrypt` or `argon2`.
2. **Environment Variables:** Never commit `.env` file to version control.
3. **CORS:** Configure specific origins in production, avoid using `*`.
4. **Super Admin:** Change the default password immediately after first login.

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Migration Issues

```bash
# Reset migrations (WARNING: drops all data)
npm run db:generate
npm run db:migrate
```

### Seeder Already Ran

The seeder checks for existing super admin. To re-run:

1. Delete the super admin from database
2. Run `npm run db:seed` again

## 📚 Additional Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Express.js Docs](https://expressjs.com/)
- [Winston Logger](https://github.com/winstonjs/winston)
