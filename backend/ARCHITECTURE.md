# MVC Architecture Documentation

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── cors.config.ts   # CORS settings
│   └── database.config.ts # Database configuration
├── controllers/         # Request handlers (HTTP layer)
│   ├── health.controller.ts
│   └── user.controller.ts
├── db/                  # Database layer
│   ├── index.ts         # Database connection
│   ├── schema.ts        # Database schema
│   └── seed.ts          # Database seeder
├── middleware/          # Express middleware
│   ├── error.middleware.ts    # Error handlers
│   ├── logger.middleware.ts   # Request logging
│   └── validation.middleware.ts # Input validation
├── routes/              # API routes
│   ├── index.ts         # Route aggregator
│   └── user.routes.ts   # User routes
├── services/            # Business logic layer
│   ├── auth.service.ts  # Authentication logic
│   └── user.service.ts  # User business logic
├── types/               # TypeScript types
│   ├── response.types.ts # API response types
│   └── user.types.ts    # User-related types
├── utils/               # Utility functions
│   └── logger.ts        # Winston logger
└── index.ts             # Application entry point (40 lines!)
```

## 🏗️ Architecture Layers

### 1. **Types Layer** (`src/types/`)

Defines TypeScript interfaces and types for type safety.

**Files:**

- `user.types.ts` - User entities, DTOs, and role types
- `response.types.ts` - Standardized API response formats

### 2. **Config Layer** (`src/config/`)

Centralized configuration management.

**Files:**

- `cors.config.ts` - CORS settings
- `database.config.ts` - Database connection settings

### 3. **Services Layer** (`src/services/`)

Contains all business logic. Controllers delegate to services.

**Files:**

- `user.service.ts` - User CRUD operations
- `auth.service.ts` - Password hashing and verification

**Example:**

```typescript
// user.service.ts
class UserService {
  async getAllUsers(): Promise<UserResponse[]> { ... }
  async createUser(data: CreateUserRequest): Promise<CreateUserResult> { ... }
  async getUserByEmail(email: string): Promise<UserResponse | null> { ... }
}
```

### 4. **Controllers Layer** (`src/controllers/`)

Handles HTTP requests and responses. Thin layer that delegates to services.

**Files:**

- `user.controller.ts` - User endpoint handlers
- `health.controller.ts` - Health check handler

**Example:**

```typescript
// user.controller.ts
class UserController {
  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  }
}
```

### 5. **Routes Layer** (`src/routes/`)

Defines API endpoints and maps them to controllers.

**Files:**

- `user.routes.ts` - User routes
- `index.ts` - Aggregates all routes

**Example:**

```typescript
// user.routes.ts
router.get("/", userController.getUsers);
router.post("/", validateCreateUser, userController.createUser);
```

### 6. **Middleware Layer** (`src/middleware/`)

Reusable middleware functions.

**Files:**

- `logger.middleware.ts` - Request logging
- `validation.middleware.ts` - Input validation
- `error.middleware.ts` - Error handling

### 7. **Main Application** (`src/index.ts`)

Clean entry point that wires everything together.

```typescript
// index.ts - Only 40 lines!
app.use(cors(corsConfig));
app.use(express.json());
app.use(requestLogger);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);
```

## 🔄 Request Flow

```
Client Request
    ↓
index.ts (middleware)
    ↓
routes/index.ts (routing)
    ↓
user.routes.ts (specific route)
    ↓
validation.middleware.ts (validation)
    ↓
user.controller.ts (request handling)
    ↓
user.service.ts (business logic)
    ↓
db/index.ts (database)
    ↓
Response back to client
```

## 📝 Adding New Features

### Adding a New Entity (e.g., "Product")

1. **Create Types** (`src/types/product.types.ts`)

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

2. **Create Service** (`src/services/product.service.ts`)

```typescript
class ProductService {
  async getAllProducts() { ... }
  async createProduct() { ... }
}
```

3. **Create Controller** (`src/controllers/product.controller.ts`)

```typescript
class ProductController {
  async getProducts(req, res) { ... }
  async createProduct(req, res) { ... }
}
```

4. **Create Routes** (`src/routes/product.routes.ts`)

```typescript
router.get("/", productController.getProducts);
router.post("/", productController.createProduct);
```

5. **Register Routes** (`src/routes/index.ts`)

```typescript
import productRoutes from "./product.routes.js";
router.use("/api/products", productRoutes);
```

## 🎯 Benefits of This Architecture

### ✅ Separation of Concerns

Each layer has a single responsibility:

- **Controllers** handle HTTP
- **Services** handle business logic
- **Routes** handle routing
- **Middleware** handle cross-cutting concerns

### ✅ Testability

Easy to unit test each layer independently:

```typescript
// Test service without HTTP
const result = await userService.createUser(mockData);

// Test controller with mocked service
const mockService = { getAllUsers: jest.fn() };
```

### ✅ Maintainability

- Changes are isolated to specific layers
- Easy to find and fix bugs
- Clear code organization

### ✅ Scalability

- Easy to add new features
- Can split into microservices later
- Team members can work on different layers

### ✅ Reusability

- Services can be used by multiple controllers
- Middleware can be shared across routes
- Types ensure consistency

## 🔍 Code Examples

### Creating a User (Full Flow)

**1. Client Request:**

```bash
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**2. Route (`user.routes.ts`):**

```typescript
router.post("/", validateCreateUser, userController.createUser);
```

**3. Validation Middleware:**

```typescript
export const validateCreateUser = (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  next();
};
```

**4. Controller (`user.controller.ts`):**

```typescript
async createUser(req: Request, res: Response) {
  const result = await userService.createUser(req.body);
  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }
  res.status(201).json({ success: true, data: result.user });
}
```

**5. Service (`user.service.ts`):**

```typescript
async createUser(userData: CreateUserRequest) {
  // Check if user exists
  const existing = await this.getUserByEmail(userData.email);
  if (existing) return { success: false, error: 'Email exists' };

  // Hash password
  const hashedPassword = authService.hashPassword(userData.password);

  // Create user
  await db.insert(users).values({ ...userData, password: hashedPassword });

  return { success: true, user: newUser };
}
```

## 🛡️ Best Practices

### Controllers

- Keep thin - delegate to services
- Handle HTTP concerns only
- Return appropriate status codes

### Services

- Contain all business logic
- Independent of HTTP
- Return data, not responses

### Routes

- Define endpoints clearly
- Apply middleware in correct order
- Use descriptive route names

### Middleware

- Keep focused on one concern
- Make reusable
- Call `next()` to continue chain

### Types

- Define interfaces for all entities
- Use DTOs for requests/responses
- Leverage TypeScript for safety

## 📚 Further Reading

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
