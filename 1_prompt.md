# SmallStores — End-to-End Product Build Prompts
### *As a Product Founder with 20 Years of Experience*
### Title: Connecting eCommerce Retails

---

## PART 1: MARKET RESEARCH & PRODUCT INTELLIGENCE

---

### 🌍 Market Reality: Why This Product Exists

The global retail management software market was valued at **$2.8 billion in 2023** and is projected to reach **$7.1 billion by 2030** (CAGR of ~13.8%). But here's what the numbers don't say — **95% of that money is being captured by solutions built for enterprise retailers**, leaving behind 350+ million small and micro-retailers worldwide who are still running their businesses on paper, WhatsApp, and Excel sheets.

In India alone, there are **63 million MSMEs** in retail. Southeast Asia adds another **70 million**. Latin America, Africa, Eastern Europe — all untapped, all digitally underserved. These store owners don't need Salesforce. They don't need SAP. They need something that works on their laptop, loads fast on a 4G connection, costs less than a meal, and tells them in plain language: *"You're running low on stock. Your best customer hasn't ordered in 30 days. Your Tuesday sales are 40% higher than Monday."*

**That is the gap SmallStores fills.**

---

### 🥊 Competitor Landscape (Honest Analysis)

| Competitor | Strength | Fatal Weakness for Small Stores |
|---|---|---|
| **Shopify** | Brand, ecosystem, global reach | Expensive ($39–$399/mo), too complex, built for eComm not physical stores |
| **Square POS** | Hardware + software bundle | Hardware dependency, US/UK centric, not for inventory-heavy retail |
| **Zoho Inventory** | Feature-rich, Indian pricing | Overwhelming UI, steep learning curve, not onboarding-friendly |
| **Vyapar App** | India-focused, GST ready | Mobile-only, no multi-store, no customer management depth |
| **Marg ERP** | Deep accounting | Legacy UI, desktop-only, not SaaS, no real-time analytics |
| **StoreHippo** | Multi-store eComm | Built for online selling, not physical store management |
| **Unicommerce** | Omnichannel | Enterprise-focused, pricing kills small stores |

**The White Space SmallStores Owns:**
A web-based, mobile-responsive, affordable SaaS that handles physical store operations (inventory + orders + customers + analytics) with zero hardware dependency, multi-store support, and an onboarding flow so simple a 50-year-old shop owner in a Tier-2 city can complete it in under 10 minutes.

---

### 🎯 Target Persona (Build Everything Around These 3 People)

**Persona 1 — Ravi, 38, Grocery Store Owner, Hyderabad**
Runs 2 stores. Uses WhatsApp to take orders. Loses track of stock daily. Wants to know which products move fastest. Budget: ₹500–₹1500/month.

**Persona 2 — Priya, 31, Boutique Fashion Owner, Bangalore**
Tech-savvy. Instagram seller who also runs a physical store. Needs customer history, repeat order tracking, and a dashboard she can check from her phone. Budget: $20–$40/month.

**Persona 3 — Carlos, 44, Electronics Retailer, Manila**
Has 3 stores with different staff. Needs role-based access. Doesn't trust cloud — needs assurance of data isolation per store. Budget: $30–$60/month.

---

## PART 2: PRODUCT ARCHITECTURE THINKING

Before you write a single line of code, internalize these product principles:

1. **Each store is an island.** No store should ever see another store's data. This is non-negotiable for trust.
2. **Speed over features.** A dashboard that loads in 1 second with 5 features beats a 5-second dashboard with 20 features.
3. **The onboarding is the product.** If a store owner can't set up in 10 minutes, you've already lost them.
4. **Every API must tell a business story.** Not `GET /products/42` — but "Give me what I need to make a business decision right now."
5. **Design for low-literacy tech users.** Tooltips, empty states, success messages — these are features, not afterthoughts.

---

## PART 3: END-TO-END PROMPT SERIES

*Use these prompts in sequence. Each prompt builds on the previous one. Feed these to your AI coding assistant (Claude, ChatGPT, Cursor, etc.) one by one.*

---

### 🔴 PROMPT SERIES A — PROJECT FOUNDATION & ARCHITECTURE

---

#### PROMPT A-1 — Project Skeleton & Maven Setup

```
You are a senior Spring Boot architect with 15+ years of experience building production SaaS products.

Create the complete Maven project structure for "SmallStores" — a multi-tenant retail management SaaS application.

Base package: com.example.smallstores

Create the full folder structure with all required packages:
- entity
- repository
- service (interfaces only)
- service.impl
- controller
- dto (request and response DTOs separated)
- config (SecurityConfig, CorsConfig, JwtConfig)
- exception (GlobalExceptionHandler, custom exceptions)
- utils (JwtUtil, ResponseWrapper)

Also generate:
1. pom.xml with all dependencies:
   - spring-boot-starter-web
   - spring-boot-starter-security
   - spring-boot-starter-data-jpa
   - spring-boot-starter-validation
   - mysql-connector-j
   - jjwt (io.jsonwebtoken) 0.11.5
   - lombok
   - modelmapper or mapstruct

2. application.properties with:
   - MySQL connection (localhost, port 3306, db: smallstores_db)
   - JPA/Hibernate DDL auto: update
   - JWT secret and expiration config
   - Server port: 8080
   - CORS allowed origins: http://localhost:3000

3. SmallStoresApplication.java main class

Make this production-ready. No shortcuts. Use proper naming conventions.
```

---

#### PROMPT A-2 — Database Schema Design

```
You are a database architect designing a production-grade MySQL schema for a multi-tenant retail SaaS called SmallStores.

Design all entity classes using JPA annotations for the following tables. Each entity must:
- Use @Entity, @Table, @Id, @GeneratedValue
- Use Lombok (@Data, @NoArgsConstructor, @AllArgsConstructor, @Builder)
- Use proper relationships (@ManyToOne, @OneToMany with FetchType)
- Include audit fields: createdAt, updatedAt using @CreationTimestamp, @UpdateTimestamp
- Use @Column with nullable, length, and unique constraints

Entities to create:

1. Store
   Fields: id (Long), storeName (String, not null, max 100), ownerName (String), email (String, unique), phone (String), address (String), isActive (Boolean, default true), createdAt, updatedAt

2. User
   Fields: id (Long), username (String, unique, not null), password (String, not null), role (Enum: ADMIN/STORE_OWNER), isEnabled (Boolean), store (ManyToOne → Store), createdAt, updatedAt

3. Product
   Fields: id (Long), name (String, not null), description (String), price (BigDecimal, not null), stock (Integer, not null, min 0), category (String), sku (String, unique), isActive (Boolean), store (ManyToOne → Store), createdAt, updatedAt

4. Customer
   Fields: id (Long), name (String, not null), phone (String), email (String), address (String), store (ManyToOne → Store), totalOrders (Integer, default 0), createdAt, updatedAt

5. Order
   Fields: id (Long), orderDate (LocalDateTime), totalAmount (BigDecimal), status (Enum: PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), notes (String), store (ManyToOne → Store), customer (ManyToOne → Customer), createdAt, updatedAt

6. OrderItem
   Fields: id (Long), quantity (Integer, not null), unitPrice (BigDecimal, not null), totalPrice (BigDecimal), order (ManyToOne → Order), product (ManyToOne → Product)

Also write the raw SQL CREATE TABLE script for manual review.
The schema must enforce store-level data isolation — every query will be filtered by storeId.
```

---

#### PROMPT A-3 — JWT Security Configuration

```
You are a Spring Security expert. Build the complete JWT authentication system for SmallStores.

Create the following files:

1. JwtUtil.java (utils package)
   - generateToken(UserDetails userDetails, Long storeId)
   - validateToken(String token, UserDetails userDetails)
   - extractUsername(String token)
   - extractStoreId(String token) — store the storeId as a custom claim
   - extractExpiration(String token)
   - Token expiry: 24 hours
   - Use HS256 algorithm with secret from application.properties

2. JwtAuthenticationFilter.java (config package)
   - Extend OncePerRequestFilter
   - Extract JWT from Authorization header (Bearer token)
   - Validate token and set SecurityContextHolder
   - Inject storeId from token into request attributes for controller use

3. SecurityConfig.java (config package)
   - Use SecurityFilterChain (not WebSecurityConfigurerAdapter — it's deprecated)
   - Public endpoints: POST /api/auth/login, POST /api/auth/register
   - All other endpoints require authentication
   - Add JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter
   - Disable CSRF (REST API)
   - Stateless session management

4. CorsConfig.java (config package)
   - Allow origin: http://localhost:3000
   - Allow all headers
   - Allow methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   - Allow credentials: true

5. CustomUserDetailsService.java (service.impl)
   - Implement UserDetailsService
   - Load user by username from UserRepository
   - Return Spring Security User object with role

Use Spring Boot 3.x compatible annotations and imports.
```

---

### 🟠 PROMPT SERIES B — BACKEND FEATURE MODULES

---

#### PROMPT B-1 — Authentication Module (Register & Login)

```
You are building the Authentication module for SmallStores SaaS.

Create the complete auth flow with the following:

DTOs (in dto/request and dto/response packages):

1. RegisterRequest.java
   Fields: storeName, ownerName, storeEmail, storePhone, storeAddress, username, password
   Validations: @NotBlank, @Email, @Size(min=6) for password

2. LoginRequest.java
   Fields: username, password (both @NotBlank)

3. AuthResponse.java
   Fields: token (String), username, role, storeId, storeName, message

Service Interface: AuthService.java
   - AuthResponse register(RegisterRequest request)
   - AuthResponse login(LoginRequest request)

ServiceImpl: AuthServiceImpl.java
   Logic for register:
   - Check if username already exists → throw UserAlreadyExistsException
   - Create Store record first
   - Create User record linked to that Store with role STORE_OWNER
   - Encode password with BCryptPasswordEncoder
   - Generate JWT token with storeId embedded
   - Return AuthResponse

   Logic for login:
   - Authenticate with AuthenticationManager
   - Load user, generate token
   - Return AuthResponse with storeId and storeName

Controller: AuthController.java
   - POST /api/auth/register → 201 Created
   - POST /api/auth/login → 200 OK
   - Use @Valid on request bodies
   - Wrap responses in a standard ApiResponse wrapper

GlobalExceptionHandler.java (exception package):
   Handle:
   - UserAlreadyExistsException → 409 Conflict
   - BadCredentialsException → 401 Unauthorized
   - MethodArgumentNotValidException → 400 Bad Request (return field-level errors)
   - ResourceNotFoundException → 404 Not Found
   - Generic Exception → 500 Internal Server Error

Standard ApiResponse wrapper:
   Fields: success (boolean), message (String), data (Object), timestamp
```

---

#### PROMPT B-2 — Store Management Module

```
Build the Store Management module for SmallStores.

This module allows STORE_OWNER to view and update their own store profile.
ADMIN can view all stores.

Create:

1. StoreRequestDTO.java — storeName, ownerName, phone, address (all with validation)
2. StoreResponseDTO.java — id, storeName, ownerName, email, phone, address, isActive, createdAt

3. StoreRepository.java (JpaRepository<Store, Long>)
   - findByEmail(String email)
   - findAllByIsActive(Boolean isActive)

4. StoreService.java interface:
   - StoreResponseDTO getMyStore(Long storeId)
   - StoreResponseDTO updateStore(Long storeId, StoreRequestDTO request)
   - List<StoreResponseDTO> getAllStores() — ADMIN only

5. StoreServiceImpl.java:
   - getMyStore: fetch store by storeId, map to DTO, return
   - updateStore: validate ownership, update fields, save, return DTO
   - getAllStores: return all stores mapped to DTOs

6. StoreController.java:
   - GET /api/stores/me → get current store (extract storeId from JWT via request attribute)
   - PUT /api/stores/me → update store profile
   - GET /api/admin/stores → ADMIN only, get all stores
   
   Use @PreAuthorize("hasRole('ADMIN')") for admin endpoint.
   Extract storeId from request attribute set by JwtAuthenticationFilter.

Key rule: A STORE_OWNER can ONLY access their own store data. Enforce this at service layer.
```

---

#### PROMPT B-3 — Product Management Module

```
Build the complete Product Management module for SmallStores.

This is the most critical module — store owners live inside this module daily.

Create:

1. ProductRequestDTO.java
   Fields: name (@NotBlank), description, price (@NotNull, @DecimalMin("0.01")), 
   stock (@NotNull, @Min(0)), category (@NotBlank), sku
   
2. ProductResponseDTO.java
   Fields: id, name, description, price, stock, category, sku, isActive, storeId, storeName, createdAt

3. ProductRepository.java:
   - Page<Product> findByStoreId(Long storeId, Pageable pageable)
   - List<Product> findByStoreIdAndCategory(Long storeId, String category)
   - List<Product> findByStoreIdAndStockLessThan(Long storeId, Integer threshold) — for low stock alerts
   - Optional<Product> findByIdAndStoreId(Long id, Long storeId)
   - List<String> findDistinctCategoriesByStoreId(Long storeId)

4. ProductService.java interface:
   - ProductResponseDTO addProduct(Long storeId, ProductRequestDTO request)
   - ProductResponseDTO updateProduct(Long storeId, Long productId, ProductRequestDTO request)
   - void deleteProduct(Long storeId, Long productId) — soft delete (isActive = false)
   - Page<ProductResponseDTO> getAllProducts(Long storeId, int page, int size, String category)
   - ProductResponseDTO getProductById(Long storeId, Long productId)
   - List<ProductResponseDTO> getLowStockProducts(Long storeId, int threshold)
   - List<String> getCategories(Long storeId)

5. ProductServiceImpl.java:
   - Always verify storeId matches before any operation
   - Throw ResourceNotFoundException if product not found
   - Throw DuplicateSkuException if SKU already exists in same store

6. ProductController.java:
   Base path: /api/products
   - POST / → add product (201)
   - PUT /{productId} → update product
   - DELETE /{productId} → soft delete product
   - GET / → get all products (with pagination, optional ?category= filter)
   - GET /{productId} → get single product
   - GET /low-stock?threshold=10 → products below stock threshold
   - GET /categories → distinct category list for filter dropdown

All endpoints extract storeId from JWT request attribute.
Return paginated responses with PageResponseDTO wrapper (content, totalPages, totalElements, currentPage).
```

---

#### PROMPT B-4 — Customer Management Module

```
Build the Customer Management module for SmallStores.

Store owners manage their customer database — this becomes the CRM layer of the product.

Create:

1. CustomerRequestDTO.java
   Fields: name (@NotBlank), phone, email (@Email), address

2. CustomerResponseDTO.java
   Fields: id, name, phone, email, address, totalOrders, storeId, createdAt

3. CustomerRepository.java:
   - Page<Customer> findByStoreId(Long storeId, Pageable pageable)
   - Optional<Customer> findByIdAndStoreId(Long id, Long storeId)
   - Optional<Customer> findByPhoneAndStoreId(String phone, Long storeId)
   - List<Customer> findByStoreIdOrderByTotalOrdersDesc(Long storeId) — VIP customers
   - long countByStoreId(Long storeId)

4. CustomerService.java interface:
   - CustomerResponseDTO addCustomer(Long storeId, CustomerRequestDTO request)
   - CustomerResponseDTO updateCustomer(Long storeId, Long customerId, CustomerRequestDTO request)
   - void deleteCustomer(Long storeId, Long customerId)
   - Page<CustomerResponseDTO> getAllCustomers(Long storeId, int page, int size)
   - CustomerResponseDTO getCustomerById(Long storeId, Long customerId)
   - List<CustomerResponseDTO> getTopCustomers(Long storeId, int limit)
   - CustomerResponseDTO getCustomerByPhone(Long storeId, String phone)

5. CustomerServiceImpl.java:
   - Check for duplicate phone per store before adding
   - Enforce store isolation on all operations

6. CustomerController.java:
   Base path: /api/customers
   - POST / → add customer (201)
   - PUT /{customerId} → update customer
   - DELETE /{customerId} → delete customer
   - GET / → paginated list
   - GET /{customerId} → single customer
   - GET /top?limit=10 → top customers by order count
   - GET /search?phone={phone} → find by phone number
```

---

#### PROMPT B-5 — Order Management Module

```
Build the Order Management module — the transactional core of SmallStores.

This handles order creation, status tracking, and order history.

Create:

1. OrderItemRequestDTO.java — productId (Long), quantity (Integer, @Min(1))
2. OrderRequestDTO.java — customerId (Long), notes (String), items (List<OrderItemRequestDTO>, @NotEmpty)
3. OrderItemResponseDTO.java — id, productId, productName, quantity, unitPrice, totalPrice
4. OrderResponseDTO.java — id, orderDate, totalAmount, status, notes, customerId, customerName, storeId, items (List<OrderItemResponseDTO>), createdAt

5. OrderRepository.java:
   - Page<Order> findByStoreId(Long storeId, Pageable pageable)
   - Page<Order> findByStoreIdAndStatus(Long storeId, OrderStatus status, Pageable pageable)
   - Optional<Order> findByIdAndStoreId(Long id, Long storeId)
   - List<Order> findByStoreIdAndOrderDateBetween(Long storeId, LocalDateTime start, LocalDateTime end)
   - BigDecimal sumTotalAmountByStoreId(Long storeId) — for analytics
   - long countByStoreIdAndStatus(Long storeId, OrderStatus status)

6. OrderService.java interface:
   - OrderResponseDTO createOrder(Long storeId, OrderRequestDTO request)
   - OrderResponseDTO updateOrderStatus(Long storeId, Long orderId, OrderStatus status)
   - OrderResponseDTO getOrderById(Long storeId, Long orderId)
   - Page<OrderResponseDTO> getAllOrders(Long storeId, OrderStatus status, int page, int size)
   - void cancelOrder(Long storeId, Long orderId)

7. OrderServiceImpl.java — Critical business logic:
   - When creating order:
     * Validate all products belong to same store
     * Check stock availability for each item
     * Calculate unitPrice from current product price
     * Deduct stock from each product atomically
     * Calculate totalAmount (sum of all item totals)
     * Increment customer.totalOrders by 1
     * Set initial status: PENDING
   - When cancelling order:
     * Only cancel PENDING or CONFIRMED orders
     * Restore stock for each OrderItem back to products
     * Decrement customer.totalOrders
   - Status transitions: PENDING → CONFIRMED → SHIPPED → DELIVERED (no skip, no reverse)
   - Use @Transactional on createOrder and cancelOrder

8. OrderController.java:
   Base path: /api/orders
   - POST / → create order (201)
   - GET / → paginated orders (optional ?status= filter)
   - GET /{orderId} → single order with items
   - PATCH /{orderId}/status → update status (body: {"status": "CONFIRMED"})
   - DELETE /{orderId} → cancel order
```

---

#### PROMPT B-6 — Analytics / Dashboard Module

```
Build the Sales Analytics module for SmallStores dashboard.

This is what store owners open first every morning — make it powerful and fast.

Create:

1. DashboardStatsDTO.java:
   Fields:
   - totalRevenue (BigDecimal) — all time
   - revenueToday (BigDecimal)
   - revenueThisMonth (BigDecimal)
   - totalOrders (Long) — all time
   - ordersToday (Long)
   - ordersThisMonth (Long)
   - totalProducts (Long)
   - lowStockCount (Long) — products with stock < 10
   - totalCustomers (Long)
   - pendingOrders (Long)
   - topSellingProducts (List<ProductSalesDTO>) — top 5
   - recentOrders (List<OrderResponseDTO>) — last 5 orders

2. ProductSalesDTO.java — productId, productName, category, totalQuantitySold, totalRevenue

3. MonthlySalesDTO.java — month (String), year (int), totalRevenue (BigDecimal), totalOrders (Long)

4. AnalyticsRepository or custom JPQL queries in OrderRepository:
   - findTotalRevenueByStoreIdAndDateBetween
   - findOrderCountByStoreIdAndDateBetween
   - findTopSellingProductsByStoreId (GROUP BY product, ORDER BY SUM(quantity) DESC, LIMIT 5)
   - findMonthlySalesTrend (GROUP BY MONTH, YEAR — last 12 months)

5. DashboardService.java interface:
   - DashboardStatsDTO getDashboardStats(Long storeId)
   - List<MonthlySalesDTO> getMonthlySalesTrend(Long storeId, int months)
   - List<ProductSalesDTO> getTopSellingProducts(Long storeId, int limit)

6. DashboardServiceImpl.java:
   - Aggregate all stats in a single service call
   - Use LocalDateTime.now() with start-of-day and start-of-month calculations
   - Combine multiple repository calls efficiently

7. DashboardController.java:
   Base path: /api/dashboard
   - GET /stats → full dashboard stats (single API call for React dashboard)
   - GET /sales/monthly?months=12 → monthly trend data for chart
   - GET /products/top?limit=5 → top products for bar chart

Design these APIs to minimize frontend API calls — the dashboard should load with 1-2 API calls max.
```

---

### 🟡 PROMPT SERIES C — FRONTEND FOUNDATION

---

#### PROMPT C-1 — React Project Setup & Architecture

```
You are a senior React architect setting up a production-grade frontend for SmallStores SaaS.

Create the complete React project structure using Create React App or Vite (prefer Vite for speed).

Install and configure:
- react-router-dom v6 (routing)
- axios (API calls)
- tailwindcss + postcss + autoprefixer
- react-hot-toast (notifications)
- recharts (for sales charts)
- @heroicons/react (icons)
- react-hook-form (form management)
- yup (form validation with react-hook-form)

Folder structure to create:
src/
├── api/              (axios instance + all API functions)
├── components/       (reusable UI components)
│   ├── common/       (Button, Input, Modal, Table, Badge, Spinner, EmptyState)
│   ├── layout/       (Sidebar, Navbar, DashboardLayout)
│   └── charts/       (SalesChart, TopProductsChart)
├── pages/            (one folder per page)
│   ├── auth/         (Login, Register)
│   ├── dashboard/    (Dashboard)
│   ├── products/     (ProductList, AddProduct, EditProduct)
│   ├── inventory/    (InventoryPage)
│   ├── orders/       (OrderList, OrderDetail, CreateOrder)
│   └── customers/    (CustomerList, AddCustomer)
├── context/          (AuthContext)
├── hooks/            (useAuth, useStore, usePagination)
├── routes/           (ProtectedRoute, AppRouter)
├── utils/            (formatCurrency, formatDate, constants)
└── styles/           (global.css with Tailwind imports)

Create:
1. axios instance (api/axiosConfig.js):
   - baseURL: http://localhost:8080/api
   - Request interceptor: attach JWT token from localStorage
   - Response interceptor: handle 401 (redirect to login), 403 (show forbidden), 500 (show error toast)

2. AuthContext.js:
   - Store: token, user (username, role, storeId, storeName)
   - Methods: login(data), logout(), isAuthenticated()
   - Persist to localStorage on login, clear on logout

3. ProtectedRoute.jsx:
   - Check isAuthenticated from AuthContext
   - Redirect to /login if not authenticated
   - Support role-based protection (adminOnly prop)

4. AppRouter.jsx:
   - Public routes: /login, /register
   - Protected routes wrapped in DashboardLayout:
     / → Dashboard
     /products → Product List
     /inventory → Inventory
     /orders → Orders
     /customers → Customers
     /orders/create → Create Order
     /orders/:id → Order Detail

5. tailwind.config.js with custom colors:
   Primary: indigo (#4F46E5)
   Secondary: slate
   Success: emerald
   Warning: amber
   Danger: red
```

---

#### PROMPT C-2 — Layout & Navigation Components

```
Build the professional dashboard layout for SmallStores — this is the shell every page lives inside.

Create the following components with Tailwind CSS:

1. DashboardLayout.jsx:
   - Full-height layout: fixed sidebar on left, content area on right
   - Responsive: sidebar collapses to hamburger menu on tablet
   - Render <Sidebar /> + <Navbar /> + <Outlet /> (react-router)

2. Sidebar.jsx:
   - Fixed width: 256px (w-64)
   - Dark background: bg-slate-900
   - Logo area at top: "SmallStores" with store icon, show storeName below in smaller text
   - Navigation items with icons (@heroicons):
     * Dashboard (HomeIcon)
     * Products (CubeIcon)
     * Inventory (ArchiveBoxIcon)
     * Orders (ShoppingCartIcon)
     * Customers (UsersIcon)
     * Store Profile (BuildingStorefrontIcon)
   - Active link: highlighted with bg-indigo-600, white text, left border accent
   - Inactive link: text-slate-400, hover:bg-slate-800
   - Logout button at bottom (ArrowRightOnRectangleIcon)
   - Each nav item should have icon + label side by side

3. Navbar.jsx (top bar):
   - Height: 64px, bg-white, shadow-sm, border-b
   - Left: Page title (dynamic based on current route)
   - Right: 
     * Store name badge (indigo pill)
     * User avatar circle with username initial
     * Notification bell icon (future feature placeholder)

4. Common Components:

   Button.jsx — variants: primary, secondary, danger, ghost, sizes: sm/md/lg, loading state with spinner

   Input.jsx — label, error message, helper text, icons support (left/right), full Tailwind styling

   Badge.jsx — variants for order status: PENDING (amber), CONFIRMED (blue), SHIPPED (indigo), DELIVERED (emerald), CANCELLED (red)

   Table.jsx — reusable table with columns config, loading skeleton, empty state with illustration message

   Modal.jsx — overlay modal with title, content slot, footer buttons, close on backdrop click

   Spinner.jsx — centered loading spinner (indigo color)

   EmptyState.jsx — icon + title + description + optional CTA button (for empty lists)

   PageHeader.jsx — page title + subtitle + optional right-side action button

Use consistent design system: rounded-lg cards, shadow-sm, consistent padding (p-6), border-gray-200 borders.
```

---

#### PROMPT C-3 — Authentication Pages

```
Build the Login and Register pages for SmallStores with professional UI.

1. Login.jsx:
   Design: Split-screen layout
   - Left panel (hidden on mobile): bg-indigo-700, gradient, show product tagline, key features list, brand illustration
   - Right panel: centered login form

   Form fields:
   - Username (with UserIcon)
   - Password (with eye toggle for show/hide, LockClosedIcon)
   - "Remember me" checkbox
   - "Forgot password?" link (placeholder for now)
   
   Submit button: full-width, indigo, loading state
   Below form: "Don't have an account? Register your store →"
   
   On success: store token + user in AuthContext + localStorage, redirect to /
   On error: show inline error message in red below form (not just toast)
   
   Use react-hook-form + yup validation:
   - username: required, min 3 chars
   - password: required, min 6 chars

2. Register.jsx:
   Design: Two-column form layout on desktop, single column on mobile
   Title: "Register Your Store" with step indicator showing: Store Info → Account Setup → Done

   Section 1 — Store Information:
   - Store Name, Owner Name, Store Email, Phone, Address (textarea)

   Section 2 — Account Setup:
   - Username, Password, Confirm Password

   Validation (yup):
   - All required fields
   - Email format
   - Phone: 10 digits
   - Password min 8 chars
   - Confirm password must match

   Submit: "Launch My Store" button — full width, indigo, large
   
   On success: auto-login (use token from register response), show success toast "Welcome to SmallStores! Your store is ready.", redirect to /
   On error: show field-level errors + toast for server errors

   Link at bottom: "Already have a store? Sign in"
```

---

#### PROMPT C-4 — Dashboard Page

```
Build the main Dashboard page for SmallStores — this is the "command center" for store owners.

API calls:
- GET /api/dashboard/stats → load all KPIs
- GET /api/dashboard/sales/monthly?months=6 → load chart data

Layout: responsive grid with cards

Section 1 — KPI Cards Row (4 cards, responsive grid: 4 cols desktop, 2 cols tablet, 1 col mobile):

Card 1: Total Revenue (this month) — large number, green text, TrendingUpIcon, % change vs last month
Card 2: Total Orders (this month) — ShoppingCartIcon, count, badge for pending orders
Card 3: Total Products — CubeIcon, count, small warning if low stock count > 0
Card 4: Total Customers — UsersIcon, count

Each card: bg-white, rounded-xl, shadow-sm, p-6, left colored border accent

Section 2 — Charts Row (2/3 + 1/3 split):

Left chart (2/3): Monthly Revenue Trend — recharts AreaChart or LineChart
- X axis: month names, Y axis: revenue in ₹/$
- Smooth curve, indigo fill with opacity
- Tooltip showing exact revenue and orders for that month

Right chart (1/3): Top 5 Products by Sales — recharts HorizontalBarChart
- Product name on Y axis, sales value on X axis
- Indigo bars

Section 3 — Two-column bottom section:

Left: Recent Orders table (last 5 orders)
- Columns: Order ID, Customer, Amount, Status (badge), Date
- "View all orders →" link

Right: Low Stock Alerts
- List of products with stock < 10
- Red badge showing stock count
- "Restock" button linking to inventory
- If no low stock: show green checkmark EmptyState

Loading state: use skeleton loaders (gray animated placeholder blocks) while APIs load.
Error state: show retry button with error message.
```

---

#### PROMPT C-5 — Product Management Page

```
Build the Product Management page for SmallStores.

This is where store owners add and manage their product catalog.

API integrations:
- GET /api/products?page=0&size=10&category= → paginated list
- POST /api/products → add product
- PUT /api/products/:id → edit product
- DELETE /api/products/:id → soft delete
- GET /api/products/categories → category filter options
- GET /api/products/low-stock → for inventory alerts

Layout: Full page with header, filters bar, product table/grid, pagination

Header: <PageHeader title="Products" subtitle="Manage your store catalog" />
Action button: "+ Add Product" (opens modal)

Filters bar (horizontal row):
- Search input (searches by name, SKU)
- Category dropdown (populated from /api/products/categories)
- Stock filter: All / In Stock / Low Stock / Out of Stock
- View toggle: Table view / Grid view

Table View columns: Thumbnail placeholder | Name | SKU | Category | Price | Stock (colored badge) | Status | Actions
- Stock badge: red if ≤5, amber if ≤20, green if >20
- Actions: Edit (pencil icon) | Delete (trash icon, confirm modal)
- Click row → expand to show description

Grid View: Product cards in 3-col grid
- Card: product image placeholder, name, category badge, price (large), stock count, Edit/Delete buttons

Add/Edit Product Modal:
- Fields: Name, SKU, Category (free text + dropdown suggestions), Description (textarea), Price, Stock
- Form validation with react-hook-form + yup
- On submit: show loading, call API, close modal, refresh list, success toast

Delete Confirmation Modal:
"Are you sure you want to remove [product name] from your catalog? This cannot be undone."
Cancel | Remove Product (red button)

Pagination component: Previous / Page numbers / Next
Show: "Showing 1-10 of 47 products"
```

---

#### PROMPT C-6 — Orders & Create Order Pages

```
Build the Orders Management section for SmallStores.

This includes: Order List, Order Detail, and Create Order flow.

--- ORDER LIST PAGE ---

Header: "Orders" + "Create New Order" button (primary, right side)

Filter bar:
- Status filter tabs: All | Pending | Confirmed | Shipped | Delivered | Cancelled
- Date range picker (from / to)
- Search by customer name or order ID

Orders Table columns:
Order # | Customer | Date | Items Count | Total Amount | Status (badge) | Actions

Actions column:
- View (eye icon) → goes to /orders/:id
- Update Status (arrow icon) → opens mini dropdown
- Cancel (X icon, only for PENDING/CONFIRMED)

Status Badge colors match backend enums (amber/blue/indigo/emerald/red)

Empty state: "No orders yet. Create your first order →"

--- ORDER DETAIL PAGE (/orders/:id) ---

Back button: "← Back to Orders"
Order header: Order #ID | Date | Status badge (large) | Update Status button

Two-column layout:
Left: Order Items table — Product name, Quantity, Unit Price, Total Price
Bottom: Order subtotal / total

Right: Customer info card — name, phone, email, address
Store notes card (if notes exist)

Order Timeline (visual): PENDING → CONFIRMED → SHIPPED → DELIVERED
Highlight current status, grey out future steps.

Update Status modal: dropdown to select next valid status + confirm button.

--- CREATE ORDER PAGE (/orders/create) ---

Step 1 — Select Customer:
- Search customers by name or phone
- Show matching customer cards
- "New Customer" option (inline quick-add form)

Step 2 — Add Products:
- Search products from store catalog
- Click product to add to order
- Quantity selector (+/-) for each added item
- Real-time cart total updating

Step 3 — Order Summary:
- Customer info recap
- Items list with quantities and prices
- Total amount
- Notes textarea (optional)
- "Place Order" button

Show running subtotal in sticky bottom bar while adding products.
Disable product if stock = 0 (show "Out of Stock" overlay).
```

---

#### PROMPT C-7 — Customers & Inventory Pages

```
Build the Customers page and Inventory page for SmallStores.

=== CUSTOMERS PAGE ===

Header: "Customers" + "Add Customer" button

Stats row (3 cards): Total Customers | Top Customer (by orders) | New This Month

Search & Filter: search by name/phone/email

Customer Table columns:
Avatar (initials circle) | Name | Phone | Email | Total Orders | Joined Date | Actions

Actions: Edit | View Orders (navigates to /orders filtered by customer) | Delete

Add/Edit Customer Modal:
Fields: Name, Phone, Email, Address
Validation: name required, phone required (10 digits), email optional but valid format if provided
Check duplicate phone on save

Customer Card (expandable on row click):
Show: full contact info + order history count + "View all orders" link

Empty State: "No customers yet. Create your first customer to start taking orders."

=== INVENTORY PAGE ===

Purpose: This page is purely about stock monitoring and management.

Header: "Inventory" subtitle: "Monitor and manage your product stock levels"

Summary cards row (3):
- Total SKUs in inventory
- Low Stock Items (stock < 10) — amber/warning card
- Out of Stock Items (stock = 0) — red/danger card

Stock Level Filters (tabs): All Products | Low Stock | Out of Stock | Healthy Stock

Inventory Table columns:
Product Name | Category | SKU | Current Stock | Stock Status (badge) | Price | Quick Update Stock

"Quick Update Stock" column:
- Inline input field showing current stock value
- Edit icon → turns input editable
- Save/Cancel buttons appear on edit mode
- PATCH request on save → refresh list

Stock Status badges:
0 = "Out of Stock" (red) | 1-10 = "Low Stock" (amber) | 11-50 = "In Stock" (blue) | 50+ = "Well Stocked" (green)

Bulk Restock option:
- Checkbox on each row → select multiple products
- "Bulk Update Stock" button appears → modal to set quantity adjustment (+add / set exact)

Low Stock Alert Banner (if any low stock):
Orange banner at top: "⚠️ 7 products are running low on stock. Review and restock before you run out."
```

---

### 🟢 PROMPT SERIES D — PRODUCTION READINESS

---

#### PROMPT D-1 — Exception Handling & API Standardization

```
Implement production-grade error handling and API response standardization for SmallStores.

1. Standard API Response Wrapper (ApiResponse.java):
   Create a generic wrapper: ApiResponse<T>
   Fields: success (boolean), message (String), data (T), errors (Map<String, String>), timestamp (LocalDateTime)
   
   Static factory methods:
   - ApiResponse.success(T data, String message)
   - ApiResponse.success(T data)
   - ApiResponse.error(String message)
   - ApiResponse.validationError(Map<String, String> errors)

2. Custom Exceptions (exception package):
   - ResourceNotFoundException(String message) → 404
   - UserAlreadyExistsException(String message) → 409
   - DuplicateSkuException(String message) → 409
   - InsufficientStockException(String message, String productName, int available) → 400
   - UnauthorizedAccessException(String message) → 403
   - InvalidOrderStatusException(String message) → 400
   - StoreNotFoundException(String message) → 404

3. GlobalExceptionHandler.java (@RestControllerAdvice):
   Handle every custom exception + standard Spring exceptions:
   - MethodArgumentNotValidException → 400 with field-level error map
   - ConstraintViolationException → 400
   - HttpMessageNotReadableException → 400 "Invalid request format"
   - DataIntegrityViolationException → 409 "Data conflict"
   - AccessDeniedException → 403
   - AuthenticationException → 401
   - NoHandlerFoundException → 404
   - Exception (catch-all) → 500 with generic message (don't expose stack trace)

4. Request/Response Logging Filter (LoggingFilter.java):
   - Log every incoming request: method, URI, storeId from JWT
   - Log every outgoing response: status code, response time in ms
   - Use SLF4J with structured log format
   - Exclude /api/auth endpoints from detailed logging

5. Update ALL controllers to use ApiResponse wrapper consistently.
   Every endpoint must return ResponseEntity<ApiResponse<T>>.
   Use proper HTTP status codes everywhere.
```

---

#### PROMPT D-2 — Security Hardening & Final Config

```
Implement security hardening and production configuration for SmallStores.

1. Store Isolation Enforcement (critical):
   Create StoreContextHolder utility:
   - Store the authenticated user's storeId in thread-local during request
   - Every service method must call StoreContextHolder.getStoreId() instead of accepting it as parameter
   - This prevents storeId injection attacks via request body or path params

   Create @StoreSecured annotation for service methods that auto-validates store ownership.

2. Input Sanitization:
   Add sanitization for all String inputs:
   - Strip HTML tags from all text inputs
   - Prevent SQL injection (JPA parameterized queries already help, but add layer)
   - Add @SafeHtml or manual sanitization on storeName, productName, customerName fields

3. Rate Limiting (basic):
   Add a simple in-memory rate limiter for auth endpoints:
   - Max 5 failed login attempts per IP in 15 minutes → return 429 Too Many Requests
   - Use a ConcurrentHashMap with cleanup scheduler

4. application.properties — Production config:
   Create two profiles:
   
   application-dev.properties:
   - spring.jpa.show-sql=true
   - spring.jpa.hibernate.ddl-auto=update
   - Log level: DEBUG
   
   application-prod.properties:
   - spring.jpa.show-sql=false
   - spring.jpa.hibernate.ddl-auto=validate
   - Log level: WARN
   - Connection pool: HikariCP maxPoolSize=20
   - JWT expiry: 8 hours (tighter in prod)

5. CORS production config:
   Make allowed origins configurable via application.properties
   (cors.allowed-origins=${CORS_ORIGINS:http://localhost:3000})

6. API versioning preparation:
   Ensure all endpoints are under /api/v1/ path prefix
   (Add v1 to base mapping on all controllers)

7. Health check endpoint:
   GET /api/health → return { status: "UP", service: "SmallStores", version: "1.0.0", timestamp }
   No authentication required.
```

---

#### PROMPT D-3 — Frontend Production Polish

```
Polish the SmallStores React frontend to production quality.

1. Loading States — implement everywhere:
   - Skeleton loaders for tables (gray animated blocks mimicking content)
   - Button loading spinners on form submit
   - Full-page loader on initial auth check
   - Inline loading for status updates

2. Toast Notification System (react-hot-toast):
   - Success: green, bottom-right, 3 seconds
   - Error: red, bottom-right, 5 seconds
   - Warning: amber, for low stock alerts
   - Loading: with promise API for async operations
   
   Create a toastService.js wrapper with methods:
   toast.success(), toast.error(), toast.warning(), toast.loading()

3. Form UX Improvements:
   - Real-time validation feedback (not just on submit)
   - Disable submit button if form is invalid
   - Auto-focus first field on modal open
   - Press Escape to close modals
   - Prevent double-submission (disable button after first click)

4. Pagination Component (reusable):
   - Show page numbers (with ellipsis for large counts)
   - Items per page selector: [10, 25, 50]
   - "Showing X-Y of Z results" text
   - Keyboard accessible (left/right arrow support)

5. Empty States — create for every list page:
   - Custom illustration or icon per page
   - Helpful message explaining what the page is for
   - CTA button ("Add your first product", "Create your first order")

6. 404 Page:
   Clean page with "Page not found" message and "Back to Dashboard" button

7. Responsive breakpoints — audit all pages:
   - Mobile (< 640px): stack everything, hide non-essential columns
   - Tablet (640-1024px): 2-column grids, collapsible sidebar
   - Desktop (> 1024px): full layout

8. Performance:
   - React.memo on expensive list components
   - useMemo for filtered/sorted data
   - Debounce search inputs (300ms delay before API call)
   - Lazy load page components with React.lazy + Suspense

9. .env configuration:
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   REACT_APP_APP_NAME=SmallStores

10. README.md — write professional README with:
    - Product description
    - Tech stack
    - Setup instructions (backend + frontend)
    - Environment variables reference
    - API endpoint documentation summary
    - Screenshots placeholder section
```

---

#### PROMPT D-4 — Testing Strategy

```
Write comprehensive tests for SmallStores critical paths.

Backend Tests (JUnit 5 + Mockito + Spring Boot Test):

1. AuthServiceImplTest.java:
   - testRegister_Success: mock repo, verify store created, user created, JWT returned
   - testRegister_DuplicateUsername: expect UserAlreadyExistsException
   - testLogin_Success: mock auth manager, verify JWT contains storeId
   - testLogin_BadCredentials: expect AuthenticationException

2. ProductServiceImplTest.java:
   - testAddProduct_Success: verify saved with correct storeId
   - testAddProduct_DuplicateSku: expect DuplicateSkuException
   - testGetProduct_WrongStore: expect UnauthorizedAccessException
   - testDeleteProduct_SoftDelete: verify isActive set to false, not actually deleted
   - testGetLowStockProducts: verify threshold filtering

3. OrderServiceImplTest.java:
   - testCreateOrder_Success: verify stock deducted, totalAmount calculated, customer.totalOrders incremented
   - testCreateOrder_InsufficientStock: expect InsufficientStockException with product details
   - testCancelOrder_RestoresStock: verify stock restored after cancellation
   - testUpdateStatus_InvalidTransition: expect InvalidOrderStatusException

4. Integration Tests (OrderControllerIntegrationTest.java):
   - Use @SpringBootTest + @AutoConfigureMockMvc
   - Use H2 in-memory DB for tests (test profile)
   - testCreateOrder_Authenticated: full HTTP flow with JWT header
   - testCreateOrder_Unauthorized: expect 401 without token
   - testCreateOrder_WrongStore: expect 403 if storeId mismatch

Frontend Tests (React Testing Library + Jest):

5. AuthContext.test.js:
   - test login sets token in localStorage and context
   - test logout clears everything

6. ProtectedRoute.test.js:
   - test redirects to /login when not authenticated
   - test renders children when authenticated

7. ProductList.test.js:
   - test renders product table with mock data
   - test shows empty state when no products
   - test search filter updates displayed results

Create test/application.properties:
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

---

### 🔵 PROMPT SERIES E — DEPLOYMENT

---

#### PROMPT E-1 — Deployment Configuration

```
Prepare SmallStores for production deployment.

1. Backend — Dockerfile:
   Multi-stage build:
   Stage 1 (build): Use maven:3.9-openjdk-17, copy pom.xml + src, run mvn clean package -DskipTests
   Stage 2 (run): Use openjdk:17-jre-slim, copy JAR from build stage, EXPOSE 8080, ENTRYPOINT

2. Frontend — Dockerfile:
   Stage 1 (build): node:18-alpine, npm ci, npm run build
   Stage 2 (serve): nginx:alpine, copy build to nginx html dir, copy nginx.conf

3. nginx.conf for React SPA:
   - Serve static files
   - Proxy /api/* to backend:8080
   - Handle client-side routing (try_files $uri /index.html)

4. docker-compose.yml (development):
   Services:
   - mysql: mysql:8.0, MYSQL_ROOT_PASSWORD, MYSQL_DATABASE: smallstores_db, port 3306, named volume
   - backend: build from ./backend, depends_on: mysql, env SPRING_PROFILES_ACTIVE=dev
   - frontend: build from ./frontend, depends_on: backend, port 3000→80

5. Environment variables to externalize (never hardcode):
   Backend:
   - DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
   - JWT_SECRET, JWT_EXPIRY
   - CORS_ORIGINS
   
   Frontend:
   - REACT_APP_API_BASE_URL

6. MySQL initialization script (init.sql):
   CREATE DATABASE IF NOT EXISTS smallstores_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'smallstores_user'@'%' IDENTIFIED BY '${DB_PASSWORD}';
   GRANT ALL PRIVILEGES ON smallstores_db.* TO 'smallstores_user'@'%';

7. .dockerignore files for both services (node_modules, target, .env, .git)

8. GitHub Actions CI/CD pipeline (.github/workflows/deploy.yml):
   Trigger: push to main
   Jobs:
   - test: run backend tests, run frontend tests
   - build: build docker images, tag with commit SHA
   - deploy: push to registry (Docker Hub or ECR), trigger deployment

Deployment target options (document all three):
Option A: AWS EC2 + RDS MySQL (production recommended)
Option B: Railway.app (fastest for MVP launch)
Option C: DigitalOcean App Platform (balanced cost/control)
```

---

## PART 4: PRODUCT FOUNDER'S EXECUTION ROADMAP

---

### 📅 Build Sequence (Execute in This Exact Order)

| Week | Days | Prompts | Goal |
|---|---|---|---|
| Week 1 | Day 1-2 | A-1, A-2 | Project skeleton + Database design |
| Week 1 | Day 3-4 | A-3 | Security & JWT setup |
| Week 1 | Day 5 | B-1 | Auth module (Register/Login) |
| Week 1 | Day 6-7 | — | Test auth end-to-end. Fix. Document APIs. |
| Week 2 | Day 8-9 | B-2, B-3 | Store + Product modules |
| Week 2 | Day 10-11 | B-4, B-5 | Customer + Order modules |
| Week 2 | Day 12 | B-6 | Analytics/Dashboard APIs |
| Week 2 | Day 13-14 | — | Test all backend APIs in Postman. Build Postman collection. |
| Week 3 | Day 15-16 | C-1, C-2 | React setup + Layout components |
| Week 3 | Day 17 | C-3 | Auth pages |
| Week 3 | Day 18-19 | C-4, C-5 | Dashboard + Products pages |
| Week 3 | Day 20-21 | C-6, C-7 | Orders + Customers + Inventory pages |
| Week 4 | Day 22-23 | D-1, D-2 | Error handling + Security hardening |
| Week 4 | Day 24 | D-3 | Frontend polish |
| Week 4 | Day 25-26 | D-4 | Testing |
| Week 4 | Day 27-28 | E-1 | Docker + Deploy to Railway/DigitalOcean |

---

### 🚀 Post-MVP Feature Roadmap (Version 2.0)

After you ship V1, the market will tell you what to build next. Based on competitor gaps and user pain points, prioritize in this order:

**Sprint 1 (Month 2):** WhatsApp order notifications via Twilio API — store owners want to know instantly when an order is placed.

**Sprint 2 (Month 2-3):** GST invoice generation (critical for Indian market) — auto-generate PDF invoices with GST breakdown per order.

**Sprint 3 (Month 3):** Customer loyalty points system — every order earns points, redeemable on next purchase. Makes SmallStores sticky.

**Sprint 4 (Month 4):** Mobile app (React Native or PWA) — store owners check sales on their phones. This is table stakes within 6 months.

**Sprint 5 (Month 5):** Payment gateway integration (Razorpay for India, Stripe for global) — collect online payments, not just record manual ones.

**Sprint 6 (Month 6):** Staff management + Role expansion — let store owners add cashier/manager roles with restricted access.

---

### 💰 Monetization Strategy (Don't Leave This for Later)

Build billing awareness into the architecture from Day 1.

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | 1 store, 50 products, 100 orders/month |
| **Starter** | $9/month | 1 store, unlimited products & orders, customer management, basic analytics |
| **Growth** | $24/month | Up to 3 stores, all features, invoice generation, WhatsApp notifications, priority support |
| **Pro** | $59/month | Unlimited stores, API access, staff management, advanced analytics, white-label option |

Integrate **Stripe** (global) or **Razorpay** (India) from Month 2. Use **Paddle** for global tax compliance if targeting international markets.

---

### 🎯 The One Thing Most Developers Miss

You're not building features. You are building **trust**. Every small store owner who puts their business data into your system is betting on you. The moment they feel their data is safe, their store is performing better, and they spend less time on admin — they become your best salespeople.

Make the **first 10 minutes** of onboarding so smooth that a store owner who has never used SaaS before can set up their store, add 3 products, and take their first order — without reading a single help document.

**That is the product. Everything else is implementation.**

---

### 📋 Quick Reference: All Prompts at a Glance

| Prompt ID | Title | Layer |
|---|---|---|
| A-1 | Project Skeleton & Maven Setup | Backend Foundation |
| A-2 | Database Schema Design | Backend Foundation |
| A-3 | JWT Security Configuration | Backend Foundation |
| B-1 | Authentication Module | Backend Feature |
| B-2 | Store Management Module | Backend Feature |
| B-3 | Product Management Module | Backend Feature |
| B-4 | Customer Management Module | Backend Feature |
| B-5 | Order Management Module | Backend Feature |
| B-6 | Analytics / Dashboard Module | Backend Feature |
| C-1 | React Project Setup & Architecture | Frontend Foundation |
| C-2 | Layout & Navigation Components | Frontend Foundation |
| C-3 | Authentication Pages | Frontend Feature |
| C-4 | Dashboard Page | Frontend Feature |
| C-5 | Product Management Page | Frontend Feature |
| C-6 | Orders & Create Order Pages | Frontend Feature |
| C-7 | Customers & Inventory Pages | Frontend Feature |
| D-1 | Exception Handling & API Standardization | Production Ready |
| D-2 | Security Hardening & Final Config | Production Ready |
| D-3 | Frontend Production Polish | Production Ready |
| D-4 | Testing Strategy | Production Ready |
| E-1 | Deployment Configuration | Ship It |

---

*These prompts form a complete, sequenced build plan for a production-grade SaaS product. Execute them in order, test after each module, and resist the urge to skip ahead. The discipline of sequential execution is what separates shipped products from eternal side projects.*

---
*SmallStores — Connecting eCommerce Retails | Built for the 350 million store owners the world forgot.*
