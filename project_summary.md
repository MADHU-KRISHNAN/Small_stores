# SmallStores SaaS — Complete Project Summary

> **Date**: February 26, 2026  
> **Project**: SmallStores — a multi-tenant SaaS dashboard for small retail store management  
> **Location**: `c:\Users\asmat\Documents\small_store`

---

## 1. Project Overview

SmallStores is a full-stack SaaS application that allows small retail store owners to manage their inventory (products), customers, and orders through a modern web dashboard. The application features JWT-based authentication, multi-tenant store isolation, and a premium dark-theme UI.

---

## 2. Technology Stack

| Layer       | Technology                                                         |
|-------------|--------------------------------------------------------------------|
| **Backend** | Java 17+, Spring Boot, Spring Security, Spring Data JPA            |
| **Auth**    | JWT (JSON Web Tokens) with `jjwt` library                         |
| **Database**| MySQL (schema seeded via `DataSeeder.java`)                       |
| **Frontend**| React 18 (Vite), React Router v6, Recharts, react-hot-toast       |
| **Styling** | Tailwind CSS with custom design system, Google Fonts (Inter)       |
| **API**     | REST endpoints, Axios with interceptors for JWT                    |

---

## 3. Backend Architecture

**Package**: `com.example.smallstores`

### 3.1 Entities (Database Models)

| Entity       | Description                                         |
|--------------|-----------------------------------------------------|
| `User.java`  | Application user with username, email, password hash, linked to a Store and Role |
| `Store.java` | Tenant store entity — each user owns one store      |
| `Role.java`  | User roles (e.g., ROLE_ADMIN)                       |
| `Product.java` | Store product with name, SKU, price, quantity      |
| `Customer.java` | Customer record with name, email, phone           |
| `Order.java` | Order header with status, total amount, linked customer |
| `OrderItem.java` | Line items within an order (product, qty, price)|
| `OrderStatus.java` | Enum: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |

### 3.2 Controllers (REST API Endpoints)

| Controller               | Endpoints                                           |
|--------------------------|-----------------------------------------------------|
| `AuthController.java`    | `POST /api/auth/signup`, `POST /api/auth/signin`    |
| `ProductController.java` | CRUD for `/api/products` (paginated)                |
| `CustomerController.java`| CRUD for `/api/customers` (paginated)               |
| `OrderController.java`   | CRUD for `/api/orders` (paginated), status updates  |
| `DashboardController.java` | `GET /api/dashboard/stats` (aggregated metrics)   |
| `StoreController.java`   | Store profile management                            |

### 3.3 Services

| Service                  | Purpose                                             |
|--------------------------|-----------------------------------------------------|
| `AuthService.java` / `AuthServiceImpl.java` | User registration, login, JWT generation |
| `ProductService.java` / `ProductServiceImpl.java` | Product CRUD with store isolation |
| `CustomerService.java` / `CustomerServiceImpl.java` | Customer CRUD with store isolation |
| `OrderService.java` / `OrderServiceImpl.java` | Order CRUD, status transitions, stock deductions |
| `DashboardService.java` / `DashboardServiceImpl.java` | Aggregated stats (totals, revenue) |
| `StoreService.java` / `StoreServiceImpl.java` | Store profile operations |

### 3.4 Security

| File                        | Purpose                                          |
|-----------------------------|--------------------------------------------------|
| `SecurityConfig.java`       | Spring Security filter chain, CORS config, endpoint rules |
| `JwtUtils.java`             | JWT token generation, validation, parsing        |
| `AuthTokenFilter.java`      | OncePerRequestFilter that extracts JWT from `Authorization` header |
| `AuthEntryPointJwt.java`    | Handles 401 unauthorized responses               |
| `UserDetailsImpl.java`      | Implements `UserDetails` for Spring Security      |
| `UserDetailsServiceImpl.java` | Loads user by username from DB                 |
| `StoreContextHolder.java`   | ThreadLocal holder for current store ID (multi-tenancy) |

### 3.5 DTOs (Data Transfer Objects)

`LoginRequest`, `SignupRequest`, `JwtResponse`, `MessageResponse`, `ApiResponse`, `PageResponseDTO`, `ProductDto`, `CustomerDto`, `OrderDto`, `OrderItemDto`, `StoreDto`

### 3.6 Exception Handling

- `GlobalExceptionHandler.java` — centralized `@ControllerAdvice`
- Custom exceptions: `ResourceNotFoundException`, `DuplicateSkuException`, `InsufficientStockException`, `InvalidOrderStatusException`, `StoreNotFoundException`, `UnauthorizedAccessException`, `UserAlreadyExistsException`

### 3.7 Data Seeder

- `DataSeeder.java` — `@Component` that seeds sample data on first run (admin user, products, customers, orders)

### 3.8 Repositories

Spring Data JPA repositories for: `User`, `Store`, `Product`, `Customer`, `Order`, `OrderItem`

---

## 4. Frontend Architecture

**Framework**: React 18 + Vite  
**Entry point**: `src/main.jsx` → `src/App.jsx`

### 4.1 Routing (App.jsx)

| Route          | Component   | Protected? |
|----------------|-------------|------------|
| `/`            | `Login`     | No         |
| `/dashboard`   | `Dashboard` | Yes        |
| `/products`    | `Products`  | Yes        |
| `/customers`   | `Customers` | Yes        |
| `/orders`      | `Orders`    | Yes        |

All protected routes are wrapped in `<ProtectedRoute>` → `<Layout>`.

### 4.2 Components

| Component              | Description                                            |
|------------------------|--------------------------------------------------------|
| `Layout.jsx`           | Main shell — sidebar + navbar + content area, mobile hamburger toggle |
| `Sidebar.jsx`          | Dark gradient sidebar with nav links, glowing active indicator, user section |
| `Navbar.jsx`           | Glassmorphism top bar with search, notification bell, user avatar dropdown |
| `ProtectedRoute.jsx`   | Auth guard — redirects to `/` if no token; shows dual-ring spinner while checking |

### 4.3 Pages

| Page             | Key Features                                                      |
|------------------|-------------------------------------------------------------------|
| `Login.jsx`      | Split-screen layout: left = animated gradient with floating shapes + brand tagline; right = login/register form with glassmorphism card, password toggle, toast notifications |
| `Dashboard.jsx`  | Personalized greeting, animated stat cards (revenue, orders, products, customers) with trend indicators, Recharts area chart with custom glassmorphism tooltip, shimmer loading skeletons |
| `Products.jsx`   | Dark themed data table, search bar, stock level badges (green/amber/red), icon avatars, glassmorphism modal for add/edit, paginated |
| `Customers.jsx`  | Gradient initial avatars, email/phone icons, glassmorphism add/edit modal, empty state, paginated |
| `Orders.jsx`     | Expandable row details showing line items, pulsing PENDING badge, status badges with colors, live total calculation in new-order modal, paginated |

### 4.4 Context & Utilities

| File               | Purpose                                              |
|--------------------|------------------------------------------------------|
| `AuthContext.jsx`  | React context providing `user`, `login()`, `logout()`, `isAuthenticated` |
| `axiosConfig.js`   | Axios instance with `baseURL`, JWT interceptor that attaches `Authorization: Bearer <token>` |
| `authUtils.js`     | Helper functions for token storage/retrieval in localStorage |

### 4.5 Configuration

| File                 | Purpose                                             |
|----------------------|-----------------------------------------------------|
| `tailwind.config.js` | Custom colors (brand violet, slate surfaces), Inter font family, 8 custom animations, custom shadows |
| `index.css`          | Inter font import, dark globals, 20+ component utility classes (`glass-card`, `input-dark`, `btn-primary`, `badge-*`, `table-dark`, `shimmer`) |
| `index.html`         | SEO meta tags, dark theme color, page title          |

---

## 5. Premium UI Overhaul — What Was Done

### 5.1 Objective

Transform the basic Tailwind UI into a stunning, production-ready dark-theme SaaS dashboard that looks like a premium $99/month product.

### 5.2 Design System Created

- **Color Palette**: Violet brand accent (`#8b5cf6`), rich slate surfaces (`#0f172a` → `#1e293b`), emerald for success, amber for warnings, red for errors
- **Typography**: Inter font from Google Fonts
- **Glassmorphism**: `backdrop-blur` cards with subtle borders and soft glows
- **Reusable CSS Classes**: `glass-card`, `input-dark`, `btn-primary`, `badge-success`, `badge-warning`, `badge-danger`, `table-dark`, `shimmer`
- **8 Custom Animations**: `fadeIn`, `fadeInUp`, `slideIn`, `scaleIn`, `shimmer`, `pulseGlow`, `float`

### 5.3 Files Modified (12 total)

| # | File                  | Changes Made                                                   |
|---|----------------------|----------------------------------------------------------------|
| 1 | `tailwind.config.js` | Custom colors, fonts, animations, shadows                      |
| 2 | `index.css`          | Inter font import, dark globals, 20+ component utility classes |
| 3 | `index.html`         | SEO meta tags, dark theme color                                |
| 4 | `App.jsx`            | Added react-hot-toast `<Toaster>` with dark styling            |
| 5 | `Layout.jsx`         | Mobile sidebar toggle, dark background                         |
| 6 | `Sidebar.jsx`        | Dark gradient, glow active indicator, user avatar section      |
| 7 | `Navbar.jsx`         | Glassmorphism bar, search input, notifications, avatar         |
| 8 | `ProtectedRoute.jsx` | Dual-ring loading spinner                                      |
| 9 | `Login.jsx`          | Split-screen redesign, floating shapes, password toggle        |
| 10| `Dashboard.jsx`      | Animated stat cards, custom tooltip, shimmer loading            |
| 11| `Products.jsx`       | Dark table, search bar, stock badges, glassmorphism modal      |
| 12| `Customers.jsx`      | Avatar initials, email/phone icons, glassmorphism modal        |
| 13| `Orders.jsx`         | Expandable rows, pulsing badges, live total in modal           |

### 5.4 Key UI Features Implemented

1. **Login Page**: Full-screen split layout — left side has an animated gradient background with floating CSS shapes and brand tagline; right side has a glassmorphism auth form with smooth tab switching between Login/Register, password visibility toggle, and toast notifications for success/error
2. **Dashboard**: Time-of-day personalized greeting ("Good Morning, username"), four animated stat cards with trend arrows and percentage changes, Recharts area chart with gradient fill and glassmorphism custom tooltip, shimmer skeleton loading states
3. **Products Page**: Search/filter bar, stock level badges (green for in-stock, amber for low stock, red for out-of-stock), icon-based product avatars, glassmorphism modal for CRUD operations
4. **Customers Page**: Gradient-colored initial avatars (each letter gets a unique color), email and phone displayed with icons, empty state design, glassmorphism modal
5. **Orders Page**: Expandable rows that reveal order line items on click, animated pulsing badge for PENDING status, color-coded status badges (CONFIRMED=blue, SHIPPED=amber, DELIVERED=green, CANCELLED=red), live total calculation in the create-order modal

---

## 6. Database Schema

The application uses MySQL with the following main tables:

- `users` — id, username, email, password, store_id, role
- `stores` — id, name, address, phone
- `products` — id, name, sku, price, quantity, store_id
- `customers` — id, name, email, phone, store_id
- `orders` — id, order_number, status, total_amount, customer_id, store_id
- `order_items` — id, order_id, product_id, quantity, unit_price

A `backup_pre_refactor_20260224.sql` database dump is available in the project root.

---

## 7. How to Run

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080` by default.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` by default.

---

## 8. Project File Structure

```
small_store/
├── backend/
│   └── src/main/java/com/example/smallstores/
│       ├── SmallStoresApplication.java
│       ├── component/       → DataSeeder.java
│       ├── config/          → SecurityConfig.java
│       ├── controller/      → Auth, Product, Customer, Order, Dashboard, Store
│       ├── dto/             → Request/Response DTOs
│       ├── entity/          → JPA entities (User, Store, Product, Customer, Order, OrderItem, Role, OrderStatus)
│       ├── exception/       → Custom exceptions + GlobalExceptionHandler
│       ├── repository/      → Spring Data JPA repositories
│       ├── security/        → JWT filter, auth entry point, user details
│       └── service/         → Business logic (interfaces + implementations)
├── frontend/
│   ├── index.html
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/             → axiosConfig.js
│       ├── context/         → AuthContext.jsx
│       ├── utils/           → authUtils.js
│       ├── components/      → Layout, Sidebar, Navbar, ProtectedRoute
│       └── pages/           → Login, Dashboard, Products, Customers, Orders
├── db_schema.txt
├── backup_pre_refactor_20260224.sql
├── 1_prompt.md
└── 2_prompt.md
```

---

*This document covers the complete SmallStores project architecture and all development work performed.*
