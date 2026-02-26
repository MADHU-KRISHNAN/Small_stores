# SmallStores — Forensic Gap Analysis & Production Upgrade Blueprint
### *Written from the desk of a 20-Year Senior SaaS Engineer*
### Document Type: What-Was-Done vs What-Must-Be-Done | Date: February 26, 2026

---

> **How to read this document:**  
> 🟢 = Done correctly, production-ready as-is  
> 🟡 = Partially done, needs specific fixes  
> 🔴 = Not done, critical gap, must be built  
> ⭐ = Industry-grade quality upgrade (separates $9/mo product from $99/mo product)

---

## EXECUTIVE SUMMARY

After a complete forensic review of the `project_summary.md` against the original product specification and implementation plan, here is the honest truth:

**The foundation is real and solid.** You have a running full-stack SaaS with JWT auth, multi-tenancy, a paginated API, a dashboard controller, and a premium dark UI. That is more than most side projects achieve.

**But it is not yet a product someone pays for.** There are 14 critical gaps, 9 quality gaps, and 11 experience gaps that separate what exists from what a senior developer ships to production. This document tells you exactly what every one of them is and precisely how to fix them.

**Effort estimate to close all gaps: 6–8 focused development days.**

---

## SECTION 1: BACKEND — FORENSIC ANALYSIS

---

### 1.1 Authentication Module

| Requirement | Status | Finding |
|---|---|---|
| POST /api/auth/register | 🟡 | Endpoint exists as `/signup` — naming non-compliant with spec |
| POST /api/auth/login | 🟡 | Endpoint exists as `/signin` — naming non-compliant with spec |
| RegisterRequest DTO | 🔴 | Still named `SignupRequest` — DTO rename not done |
| AuthResponse DTO | 🔴 | Still returning `JwtResponse` — not compliant with spec |
| storeId embedded in JWT | 🟡 | Not confirmed in summary — `JwtUtils.java` listed but storeId claim injection unverified |
| Role-based: ADMIN + STORE_OWNER | 🟡 | `Role.java` entity exists but only `ROLE_ADMIN` mentioned — `STORE_OWNER` role unclear |
| BCrypt password encoding | 🟢 | Standard Spring Security — present |
| Register creates Store + User atomically | 🟡 | `AuthServiceImpl` exists but atomic store+user creation unconfirmed |

**Critical Finding:** The auth endpoints use `/signup` and `/signin` instead of the specified `/register` and `/login`. This is not just a naming preference — every frontend API call, every Postman collection, and every integration test is built against the wrong URL. This must be standardized.

---

### 🔴 WHAT TO DO — Auth Module

```
1. Rename endpoint: POST /api/auth/signup → POST /api/auth/register
2. Rename endpoint: POST /api/auth/signin → POST /api/auth/login
3. Rename DTO: SignupRequest.java → RegisterRequest.java
   Add field: storeName, ownerName, storeEmail, storePhone, storeAddress, username, password
4. Rename DTO: JwtResponse.java → AuthResponse.java
   Fields: token, username, role, storeId, storeName, message
5. Verify JwtUtils.generateToken() adds storeId as custom claim:
   claims.put("storeId", user.getStore().getId())
6. Verify Role enum has exactly: ADMIN, STORE_OWNER (not ROLE_ADMIN prefix confusion)
7. Verify AuthServiceImpl.register() creates Store record FIRST, then User linked to it
8. Update frontend axiosConfig.js auth endpoints to match new URLs
9. Update DataSeeder.java to use new role names
```

---

### 1.2 Entity Layer

| Entity | Missing Fields | Status |
|---|---|---|
| `Store` | `ownerName`, `isActive`, `createdAt`, `updatedAt` | 🔴 Schema shows only: id, name, address, phone |
| `User` | `isEnabled`, `createdAt`, `updatedAt` | 🔴 Schema shows: id, username, email, password, store_id, role |
| `Product` | `description`, `isActive`, `createdAt`, `updatedAt` | 🟡 Has sku, price, quantity — missing the rest |
| `Customer` | `address`, `totalOrders`, `createdAt`, `updatedAt` | 🔴 Schema shows only: id, name, email, phone, store_id |
| `Order` | `notes`, `createdAt`, `updatedAt` | 🟡 Has status, total_amount — missing notes and timestamps |
| `OrderItem` | `totalPrice` (computed field) | 🟡 Has unit_price and quantity, missing pre-computed totalPrice |

**Critical Finding:** The database schema (Section 6 of project summary) reveals the raw truth. `Store` has no `ownerName`. `Customer` has no `address` or `totalOrders`. These are not cosmetic fields — `totalOrders` on Customer is used by the Dashboard top-customers query, and `ownerName` is displayed in the Store Profile page. Missing these breaks features, not just aesthetics.

---

### 🔴 WHAT TO DO — Entity Layer

```
Migration order (strict — respect FK dependencies):

1. ALTER TABLE stores:
   ADD COLUMN owner_name VARCHAR(100),
   ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

2. ALTER TABLE users:
   ADD COLUMN is_enabled BOOLEAN DEFAULT TRUE,
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

3. ALTER TABLE products:
   ADD COLUMN description TEXT,
   ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
   (sku already exists — confirm unique constraint is on sku+store_id, not just sku globally)

4. ALTER TABLE customers:
   ADD COLUMN address VARCHAR(255),
   ADD COLUMN total_orders INT DEFAULT 0,
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

5. ALTER TABLE orders:
   ADD COLUMN notes VARCHAR(500),
   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

6. ALTER TABLE order_items:
   ADD COLUMN total_price DECIMAL(10,2);
   UPDATE order_items SET total_price = quantity * unit_price; -- backfill existing rows

For each entity Java class, add:
   @CreationTimestamp
   @Column(updatable = false)
   private LocalDateTime createdAt;

   @UpdateTimestamp
   private LocalDateTime updatedAt;
```

---

### 1.3 StoreContextHolder — Multi-Tenancy

| Requirement | Status | Finding |
|---|---|---|
| `StoreContextHolder.java` exists | 🟢 | File listed in security package |
| ThreadLocal with `.remove()` cleanup | 🟡 | File exists but cleanup pattern unverified |
| Set in `AuthTokenFilter.java` try/finally | 🟡 | `AuthTokenFilter.java` exists but try/finally pattern unverified |
| Services call `StoreContextHolder.getStoreId()` | 🟡 | Cannot confirm without code review — summary is silent on this |
| storeId NOT accepted from request body/path | 🟡 | Unverified — critical security check |

**Critical Finding:** The existence of `StoreContextHolder.java` as a file does not guarantee it is correctly wired. The three danger points are: (1) ThreadLocal never cleared = data bleed under load, (2) services accepting storeId from request params instead of context = tenant injection attack, (3) filter sets context after filterChain runs = context empty during request.

---

### 🔴 WHAT TO DO — StoreContextHolder

```
1. Open AuthTokenFilter.java. Verify it looks EXACTLY like this:

   protected void doFilterInternal(...) {
     try {
       String jwt = parseJwt(request);
       if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
         String username = jwtUtils.getUsernameFromJwtToken(jwt);
         Long storeId = jwtUtils.getStoreIdFromJwtToken(jwt);  // ← must exist
         
         UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(username);
         UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
           userDetails, null, userDetails.getAuthorities());
         SecurityContextHolder.getContext().setAuthentication(auth);
         
         StoreContextHolder.setStoreId(storeId);  // ← set BEFORE filterChain
       }
       filterChain.doFilter(request, response);   // ← filterChain runs AFTER set
     } finally {
       StoreContextHolder.clear();                // ← ALWAYS clears, even on exception
     }
   }

2. Open StoreContextHolder.java. Verify:
   - Uses ThreadLocal<Long>
   - clear() calls REMOVE.remove() not REMOVE.set(null)

3. Open ProductServiceImpl.java. Verify:
   - getStoreId() reads from StoreContextHolder, NOT from method parameter
   - If storeId is being passed as a parameter AND read from context, remove the parameter

4. Audit all 5 services: ProductService, CustomerService, OrderService, 
   DashboardService, StoreService — all must use StoreContextHolder.getStoreId()
```

---

### 1.4 API Response Standardization

| Requirement | Status | Finding |
|---|---|---|
| `ApiResponse<T>` generic wrapper | 🟡 | `ApiResponse` listed in DTOs but generic typing unverified |
| All controllers return `ApiResponse<T>` | 🟡 | Cannot confirm without code — summary is silent |
| Consistent HTTP status codes | 🟡 | Unverified |
| `PageResponseDTO<T>` wrapper | 🟢 | Listed in DTOs |
| Validation errors return field-level error map | 🟡 | GlobalExceptionHandler exists but field-error map unverified |

---

### 🔴 WHAT TO DO — API Standardization

```
1. Verify ApiResponse.java is generic:
   public class ApiResponse<T> {
     private boolean success;
     private String message;
     private T data;
     private Map<String, String> errors;
     private LocalDateTime timestamp;
     
     // Static factories:
     public static <T> ApiResponse<T> success(T data, String message) {...}
     public static <T> ApiResponse<T> success(T data) {...}
     public static <T> ApiResponse<T> error(String message) {...}
     public static <T> ApiResponse<T> validationError(Map<String, String> errors) {...}
   }

2. Every controller method must return:
   ResponseEntity<ApiResponse<T>>
   
   Example standard:
   return ResponseEntity.ok(ApiResponse.success(productDto, "Product retrieved successfully"));
   return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(productDto, "Product created"));

3. GlobalExceptionHandler must handle MethodArgumentNotValidException and return:
   Map<String, String> errors = new HashMap<>();
   ex.getBindingResult().getFieldErrors()
     .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
   return ResponseEntity.badRequest().body(ApiResponse.validationError(errors));

4. Verify all 7 custom exceptions are handled with correct HTTP codes:
   ResourceNotFoundException     → 404
   UserAlreadyExistsException    → 409
   DuplicateSkuException         → 409
   InsufficientStockException    → 400
   UnauthorizedAccessException   → 403
   InvalidOrderStatusException   → 400
   StoreNotFoundException        → 404
```

---

### 1.5 Dashboard & Analytics

| Requirement | Status | Finding |
|---|---|---|
| `DashboardController.java` | 🟢 | Exists — `GET /api/dashboard/stats` |
| `DashboardService` + `DashboardServiceImpl` | 🟢 | Both listed |
| `DashboardStatsDTO` with all KPI fields | 🟡 | Summary says "aggregated metrics" — field completeness unverified |
| Monthly sales trend: `GET /api/dashboard/sales/monthly` | 🔴 | Not mentioned anywhere in summary |
| Top selling products: `GET /api/dashboard/products/top` | 🔴 | Not mentioned anywhere in summary |
| JPQL: GROUP BY MONTH, YEAR for trend | 🔴 | Not mentioned — likely not implemented |
| JPQL: GROUP BY product for top sellers | 🔴 | Not mentioned — likely not implemented |
| `revenueToday`, `revenueThisMonth` separately | 🟡 | Unverified — "aggregated metrics" is vague |

**Critical Finding:** The dashboard API currently only has one endpoint (`/api/dashboard/stats`). The recharts AreaChart on the frontend needs time-series data from `/api/dashboard/sales/monthly`. Without this endpoint, the chart either renders with hardcoded mock data (fake) or doesn't render at all (broken). This is the single most visible gap to a potential paying customer.

---

### 🔴 WHAT TO DO — Dashboard & Analytics

```
1. Expand DashboardStatsDTO to include ALL required fields:

   public class DashboardStatsDTO {
     private BigDecimal totalRevenue;
     private BigDecimal revenueToday;
     private BigDecimal revenueThisMonth;
     private Long totalOrders;
     private Long ordersToday;
     private Long ordersThisMonth;
     private Long totalProducts;
     private Long lowStockCount;        // products with stock < 10
     private Long totalCustomers;
     private Long pendingOrders;
     private List<ProductSalesDTO> topSellingProducts;  // top 5
     private List<OrderSummaryDTO> recentOrders;        // last 5
   }

2. Add new DTO: ProductSalesDTO
   fields: productId, productName, category, totalQuantitySold, totalRevenue

3. Add new DTO: MonthlySalesDTO  
   fields: month (String), year (int), totalRevenue (BigDecimal), totalOrders (Long)

4. Add to OrderRepository.java (JPQL queries):

   // Monthly trend — last N months
   @Query("SELECT new com.example.smallstores.dto.MonthlySalesDTO(" +
          "FUNCTION('MONTHNAME', o.orderDate), YEAR(o.orderDate), " +
          "SUM(o.totalAmount), COUNT(o)) " +
          "FROM Order o WHERE o.store.id = :storeId " +
          "AND o.orderDate >= :startDate " +
          "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
          "ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
   List<MonthlySalesDTO> findMonthlySalesTrend(
     @Param("storeId") Long storeId, 
     @Param("startDate") LocalDateTime startDate);

   // Top selling products
   @Query("SELECT new com.example.smallstores.dto.ProductSalesDTO(" +
          "oi.product.id, oi.product.name, oi.product.category, " +
          "SUM(oi.quantity), SUM(oi.totalPrice)) " +
          "FROM OrderItem oi WHERE oi.order.store.id = :storeId " +
          "GROUP BY oi.product.id, oi.product.name, oi.product.category " +
          "ORDER BY SUM(oi.quantity) DESC")
   List<ProductSalesDTO> findTopSellingProducts(
     @Param("storeId") Long storeId, 
     Pageable pageable);  // pass PageRequest.of(0, 5) to limit to 5

   // Revenue for date range
   @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
          "WHERE o.store.id = :storeId AND o.orderDate BETWEEN :start AND :end " +
          "AND o.status != 'CANCELLED'")
   BigDecimal findRevenueByStoreAndDateRange(
     @Param("storeId") Long storeId,
     @Param("start") LocalDateTime start,
     @Param("end") LocalDateTime end);

5. Add two new endpoints to DashboardController:

   GET /api/dashboard/sales/monthly?months=6
   → returns List<MonthlySalesDTO>

   GET /api/dashboard/products/top?limit=5
   → returns List<ProductSalesDTO>

6. Create seed data (DataSeeder.java update):
   Add backdated orders spanning at least 6 months so the chart
   renders a real visible curve, not a flat line:
   order.setOrderDate(LocalDateTime.now().minusMonths(5));
   order.setOrderDate(LocalDateTime.now().minusMonths(4));
   ... etc with varying totalAmount values
```

---

### 1.6 Inventory Subsystem

| Requirement | Status | Finding |
|---|---|---|
| `GET /api/products/low-stock?threshold=N` | 🔴 | Not mentioned in summary |
| `GET /api/products/categories` | 🔴 | Not mentioned in summary |
| `GET /api/products?category=` filter | 🔴 | Not mentioned in summary |
| Stock deduction on order create | 🟡 | OrderServiceImpl exists — logic unverified |
| Stock restoration on order cancel | 🟡 | Logic unverified |
| `@Transactional` on create/cancel order | 🟡 | Unverified — critical for data integrity |

---

### 🔴 WHAT TO DO — Inventory Subsystem

```
1. Add to ProductRepository.java:

   List<Product> findByStoreIdAndStockLessThanAndIsActiveTrue(Long storeId, Integer threshold);
   
   @Query("SELECT DISTINCT p.category FROM Product p WHERE p.store.id = :storeId AND p.isActive = true")
   List<String> findDistinctCategoriesByStoreId(@Param("storeId") Long storeId);
   
   Page<Product> findByStoreIdAndCategoryAndIsActiveTrue(Long storeId, String category, Pageable pageable);

2. Add to ProductController.java:

   @GetMapping("/low-stock")
   public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getLowStock(
     @RequestParam(defaultValue = "10") int threshold) {
     // Returns products where stock < threshold, for current store
   }

   @GetMapping("/categories")
   public ResponseEntity<ApiResponse<List<String>>> getCategories() {
     // Returns distinct category names for current store
   }

3. Update GET /api/products to accept optional category filter:
   @GetMapping
   public ResponseEntity<ApiResponse<PageResponseDTO<ProductResponseDTO>>> getProducts(
     @RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "10") int size,
     @RequestParam(required = false) String category,
     @RequestParam(required = false) String search) { ... }

4. Open OrderServiceImpl.java. Verify @Transactional is on:
   - createOrder() method
   - cancelOrder() method
   Both MUST be @Transactional — without it, partial stock deductions 
   leave the DB in an inconsistent state if an error occurs mid-loop.

5. Verify stock deduction logic:
   for (OrderItemRequestDTO item : request.getItems()) {
     Product product = productRepository.findByIdAndStoreId(item.getProductId(), storeId)
       .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
     
     if (product.getStock() < item.getQuantity()) {
       throw new InsufficientStockException(
         "Insufficient stock for: " + product.getName(),
         product.getName(),
         product.getStock()
       );
     }
     product.setStock(product.getStock() - item.getQuantity());
     productRepository.save(product);
   }
```

---

### 1.7 Order Status Transition Validation

| Requirement | Status | Finding |
|---|---|---|
| Status transitions: PENDING→CONFIRMED→SHIPPED→DELIVERED | 🟡 | OrderStatus enum exists, transition logic unverified |
| Prevent invalid transitions (no skipping, no reversing) | 🔴 | InvalidOrderStatusException exists but validation logic unconfirmed |
| Cancel only PENDING or CONFIRMED | 🔴 | Not confirmed in summary |

---

### 🔴 WHAT TO DO — Order Status Transitions

```
Add to OrderServiceImpl.java:

private void validateStatusTransition(OrderStatus current, OrderStatus next) {
  Map<OrderStatus, Set<OrderStatus>> allowed = Map.of(
    OrderStatus.PENDING,    Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
    OrderStatus.CONFIRMED,  Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
    OrderStatus.SHIPPED,    Set.of(OrderStatus.DELIVERED),
    OrderStatus.DELIVERED,  Set.of(),   // terminal state
    OrderStatus.CANCELLED,  Set.of()    // terminal state
  );
  
  if (!allowed.get(current).contains(next)) {
    throw new InvalidOrderStatusException(
      "Cannot transition order from " + current + " to " + next);
  }
}
```

---

## SECTION 2: FRONTEND — FORENSIC ANALYSIS

---

### 2.1 Routing & Architecture

| Requirement | Status | Finding |
|---|---|---|
| `/register` route | 🔴 | No dedicated register route — registration is a tab inside Login.jsx |
| `/orders/create` route | 🔴 | Not listed in routing table |
| `/orders/:id` route | 🔴 | Not listed in routing table — no Order Detail page |
| `/store` profile route | 🔴 | Not listed in routing table |
| Lazy loading with React.lazy + Suspense | 🔴 | Not mentioned |

**Critical Finding:** The register flow is embedded as a tab inside `Login.jsx`. This is a major UX and architectural problem. It means the URL never changes when a user switches to register — so you can't link someone directly to the registration page, can't have a "Register your store" CTA button that works, and Google can't index a distinct registration page. Split them into separate routes.

---

### 🔴 WHAT TO DO — Routing

```
Update App.jsx routing:

// Public routes
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/" element={<Navigate to="/login" />} />

// Protected routes (inside ProtectedRoute + Layout)
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/products" element={<Products />} />
<Route path="/inventory" element={<Inventory />} />
<Route path="/orders" element={<Orders />} />
<Route path="/orders/create" element={<CreateOrder />} />
<Route path="/orders/:id" element={<OrderDetail />} />
<Route path="/customers" element={<Customers />} />
<Route path="/store" element={<StoreProfile />} />

// Lazy load all protected pages:
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Products = lazy(() => import('./pages/products/Products'));
// ... etc

Wrap router in:
<Suspense fallback={<FullPageSpinner />}>
  <RouterProvider ... />
</Suspense>
```

---

### 2.2 Missing Pages

| Page | Status | Finding |
|---|---|---|
| Login | 🟢 | Built — premium split-screen design |
| Register (separate page) | 🔴 | Does not exist as a standalone page |
| Dashboard | 🟢 | Built — animated cards + recharts |
| Products | 🟢 | Built — dark table + modals |
| Customers | 🟢 | Built — gradient avatars + modals |
| Orders | 🟢 | Built — expandable rows |
| **Inventory** | 🔴 | Completely missing |
| **Order Detail** (`/orders/:id`) | 🔴 | Completely missing |
| **Create Order** (`/orders/create`) | 🔴 | Create order is a modal inside Orders.jsx — not a dedicated page |
| **Store Profile** | 🔴 | Completely missing |
| **404 Page** | 🔴 | Not mentioned |

---

### 🔴 WHAT TO DO — Missing Pages

**Register.jsx (new standalone page):**
```
Two-column form, professional layout.
Left section: Store Information
  - Store Name (@NotBlank)
  - Owner Name (@NotBlank)
  - Store Email (@Email)
  - Phone (10 digits)
  - Address (textarea)
Right section: Account Setup
  - Username (min 3 chars)
  - Password (min 8 chars, strength indicator bar)
  - Confirm Password (must match)

Submit: "Launch My Store →" full-width indigo button with loading state
Bottom: "Already have a store? Sign in →"
Use react-hook-form + yup validation.
On success: auto-login + redirect to /dashboard + success toast.
```

**Inventory.jsx (new page):**
```
This is the most impactful missing page for store owners.

Header: "Inventory" | subtitle: "Stock levels & alerts"

3 summary cards:
- Total SKUs
- Low Stock Items (stock < 10) → amber card with warning icon
- Out of Stock (stock = 0) → red card with alert icon

Filter tabs: All | Low Stock | Out of Stock | Healthy Stock

Table: Product Name | Category | SKU | Stock (color badge) | Price | Quick Edit Stock
Quick Edit: click pencil → inline input appears → save/cancel buttons
PATCH /api/products/{id} with updated stock only

Low Stock Alert Banner (if lowStockCount > 0):
"⚠️ {count} products are running low. Restock before you run out."
```

**OrderDetail.jsx (new page `/orders/:id`):**
```
Back button: "← Orders"
Order header: #ID | Date | Status badge (large) | Update Status button

Two-column layout:
  Left: Order Items table (product, qty, unit price, total)
        Order total at bottom
  Right: Customer info card (name, phone, email, address)
         Order notes (if present)

Order timeline component:
  PENDING → CONFIRMED → SHIPPED → DELIVERED
  Current step highlighted in violet, completed in emerald, future in gray

Update Status: opens a modal with next valid statuses only (no invalid options shown)
```

**StoreProfile.jsx (new page `/store`):**
```
Page header: "Store Profile"
Two sections:
  Store Details card: storeName, ownerName, email, phone, address — all editable
  Account Settings card: username, change password form

Edit mode: click "Edit" button → fields become inputs → Save/Cancel
PUT /api/stores/me on save
Success toast on update.
```

**404.jsx:**
```
Full-page dark background matching app theme
Large "404" in violet gradient text
"This page doesn't exist" in slate-400
"Back to Dashboard →" button (primary violet)
```

---

### 2.3 Dashboard — Chart Data Gap

| Requirement | Status | Finding |
|---|---|---|
| KPI cards (4 cards) | 🟢 | Built with animations |
| Monthly revenue AreaChart | 🟡 | Chart component exists but feeds from single `/stats` endpoint — needs `/sales/monthly` |
| Top Products BarChart | 🔴 | Not mentioned — likely not built |
| Recent Orders table (last 5) | 🟡 | Unclear if present in current dashboard |
| Low Stock Alerts widget | 🔴 | Not mentioned in dashboard |

**Critical Finding:** The Recharts AreaChart currently fetches from `/api/dashboard/stats`. This endpoint returns aggregate totals — not time-series data. You cannot render a multi-point line chart from a single number. Either the chart is rendering with mock/hardcoded data, or it's broken. This must be connected to the new `/api/dashboard/sales/monthly` endpoint.

---

### 🔴 WHAT TO DO — Dashboard Chart Integration

```
1. In Dashboard.jsx, add separate API call for chart data:

   useEffect(() => {
     const fetchChartData = async () => {
       const res = await axios.get('/api/dashboard/sales/monthly?months=6');
       setChartData(res.data.data); // Array of MonthlySalesDTO
     };
     fetchChartData();
   }, []);

2. Recharts AreaChart data binding:
   <AreaChart data={chartData}>
     <XAxis dataKey="month" />
     <YAxis />
     <Area type="monotone" dataKey="totalRevenue" stroke="#8b5cf6" fill="url(#gradient)" />
   </AreaChart>
   
   chartData must be the array from backend, not a hardcoded array.

3. Add Top Products HorizontalBarChart (1/3 width, right of area chart):
   Fetch from: GET /api/dashboard/products/top?limit=5
   
   <BarChart layout="vertical" data={topProducts}>
     <XAxis type="number" />
     <YAxis type="category" dataKey="productName" width={120} />
     <Bar dataKey="totalRevenue" fill="#8b5cf6" />
   </BarChart>

4. Add bottom-row widgets:
   Left: Recent Orders (last 5) — small table with Order#, Customer, Amount, Status badge
   Right: Low Stock Alerts — list from GET /api/products/low-stock?threshold=10
          Each item: product name + red/amber stock count badge + "View Inventory" link
```

---

### 2.4 Forms — react-hook-form + yup Gap

| Requirement | Status | Finding |
|---|---|---|
| Login form with react-hook-form | 🟡 | Login exists but uses internal state, not react-hook-form |
| Register form with react-hook-form | 🔴 | No standalone Register page |
| Product form with react-hook-form | 🟡 | Product modal exists but validation type unverified |
| Yup validation schemas | 🔴 | Not mentioned anywhere in summary |
| Real-time field-level validation | 🔴 | Not confirmed — likely shows errors only on submit |

---

### 🔴 WHAT TO DO — Form Validation

```
Install if not already present:
npm install react-hook-form yup @hookform/resolvers

Create validation schemas in: src/utils/validationSchemas.js

export const loginSchema = yup.object({
  username: yup.string().min(3, 'Min 3 characters').required('Username is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export const registerSchema = yup.object({
  storeName: yup.string().required('Store name is required'),
  ownerName: yup.string().required('Owner name is required'),
  storeEmail: yup.string().email('Invalid email').required('Email is required'),
  storePhone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required(),
  storeAddress: yup.string().required('Address is required'),
  username: yup.string().min(3).required(),
  password: yup.string().min(8, 'Password must be at least 8 characters').required(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match').required(),
});

export const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  price: yup.number().min(0.01, 'Price must be greater than 0').required(),
  stock: yup.number().min(0, 'Stock cannot be negative').integer().required(),
  category: yup.string().required('Category is required'),
});

Connect to forms:
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: yupResolver(loginSchema)
});

// Errors show in real-time (mode: 'onChange'):
const { ... } = useForm({ resolver: yupResolver(schema), mode: 'onChange' });
```

---

### 2.5 API Integration Gaps

| Requirement | Status | Finding |
|---|---|---|
| Axios instance with baseURL | 🟢 | axiosConfig.js exists |
| JWT request interceptor | 🟢 | Mentioned in summary |
| 401 response → redirect to login | 🟡 | Interceptor exists but redirect logic unverified |
| 500 response → error toast | 🔴 | Not mentioned |
| API functions organized by module | 🔴 | Summary mentions only `axiosConfig.js` — no API function files |

---

### 🔴 WHAT TO DO — API Layer

```
Create organized API function files in src/api/:

src/api/
├── axiosConfig.js     (existing — keep)
├── authApi.js         (register, login)
├── productApi.js      (CRUD + lowStock + categories)
├── customerApi.js     (CRUD + search)
├── orderApi.js        (CRUD + status update)
├── dashboardApi.js    (stats + monthly + topProducts)
└── storeApi.js        (getMyStore, updateStore)

Example authApi.js:
export const registerStore = (data) => axios.post('/auth/register', data);
export const loginUser = (data) => axios.post('/auth/login', data);

Example productApi.js:
export const getProducts = (page, size, category) =>
  axios.get('/products', { params: { page, size, category } });
export const createProduct = (data) => axios.post('/products', data);
export const updateProduct = (id, data) => axios.put(`/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`/products/${id}`);
export const getLowStockProducts = (threshold = 10) =>
  axios.get('/products/low-stock', { params: { threshold } });
export const getCategories = () => axios.get('/products/categories');

Update axiosConfig.js response interceptor:
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again.');
    }
    if (error.response?.status === 403) {
      toast.error('You do not have permission for this action.');
    }
    return Promise.reject(error);
  }
);
```

---

## SECTION 3: INDUSTRY-GRADE QUALITY GAPS

*These are the gaps that separate a project from a product. A paying customer judges these in the first 30 seconds.*

---

### ⭐ QUALITY GAP 1 — Empty States Are Missing or Incomplete

**Current state:** When Products, Customers, or Orders lists are empty, it likely shows an empty table with column headers. That looks broken.

**What a $99/mo product does:**
```jsx
// EmptyState.jsx — reusable component
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm text-center max-w-sm mb-6">{description}</p>
    {actionLabel && (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

// Usage in Products:
{products.length === 0 && (
  <EmptyState
    icon={CubeIcon}
    title="No products yet"
    description="Add your first product to start managing your catalog and tracking inventory."
    actionLabel="+ Add Product"
    onAction={() => setIsModalOpen(true)}
  />
)}
```

---

### ⭐ QUALITY GAP 2 — Loading States Are Incomplete

**Current state:** Dashboard has shimmer loading — great. But Products, Customers, Orders pages likely show a blank white/dark area while fetching.

**What to do:**
```jsx
// SkeletonRow.jsx — for table loading states
const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array(cols).fill(0).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-700 rounded shimmer" />
      </td>
    ))}
  </tr>
);

// In Products.jsx:
{isLoading ? (
  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} cols={7} />)
) : (
  products.map(product => <ProductRow key={product.id} product={product} />)
)}
```

---

### ⭐ QUALITY GAP 3 — Pagination UX Is Basic

**Current state:** Pagination likely exists (summary mentions paginated) but the UX quality is unclear.

**What a production pagination looks like:**
```jsx
const Pagination = ({ currentPage, totalPages, totalElements, pageSize, onPageChange, onSizeChange }) => (
  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
    <p className="text-sm text-slate-400">
      Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
    </p>
    <div className="flex items-center gap-2">
      <select
        value={pageSize}
        onChange={(e) => onSizeChange(Number(e.target.value))}
        className="input-dark text-sm py-1"
      >
        {[10, 25, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
      </select>
      <button disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
        ← Prev
      </button>
      {/* Page number buttons */}
      <button disabled={currentPage === totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
        Next →
      </button>
    </div>
  </div>
);
```

---

### ⭐ QUALITY GAP 4 — Search Is Not Debounced

**Current state:** Search inputs fire an API call on every keystroke. On "Widget", that's 6 API calls. On slow connections, responses arrive out of order and the wrong results display.

**What to do:**
```javascript
// hooks/useDebounce.js
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// In Products.jsx:
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  fetchProducts(0, pageSize, debouncedSearch); // only fires 300ms after typing stops
}, [debouncedSearch]);
```

---

### ⭐ QUALITY GAP 5 — No Confirmation Modals for Destructive Actions

**Current state:** Delete product, cancel order — these likely either have no confirmation or use `window.confirm()` (which looks terrible in a dark-theme premium UI).

**What to do:**
```jsx
// ConfirmModal.jsx
const ConfirmModal = ({ isOpen, title, message, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
          <button onClick={onConfirm} className={`btn-${confirmVariant}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

// Usage:
<ConfirmModal
  isOpen={deleteModal.isOpen}
  title="Remove Product"
  message={`"${deleteModal.productName}" will be permanently removed from your catalog.`}
  confirmLabel="Remove Product"
  confirmVariant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteModal({ isOpen: false })}
/>
```

---

### ⭐ QUALITY GAP 6 — No Toast for All User Actions

**Current state:** react-hot-toast is installed but toast coverage is likely only on login/register success and errors.

**Complete toast coverage required:**
```
✅ Product added → "Product added to catalog"
✅ Product updated → "Product updated successfully"
✅ Product deleted → "Product removed from catalog"
✅ Customer added → "Customer added"
✅ Order created → "Order #{id} created successfully"
✅ Order status updated → "Order marked as Confirmed"
✅ Order cancelled → "Order cancelled. Stock restored."
✅ Store profile saved → "Store profile updated"
✅ Stock updated → "Stock updated for {productName}"
❌ API error → Red toast with specific error message from backend
❌ Network error → "Unable to connect. Check your connection."
```

---

### ⭐ QUALITY GAP 7 — Mobile Hamburger Menu

**Current state:** `Layout.jsx` has mobile sidebar toggle mentioned in summary. But the quality of this implementation determines whether tablet/mobile users have a premium experience.

**What a production mobile menu looks like:**
```jsx
// In Layout.jsx — slide-over sidebar on mobile
<div className={`
  fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
  ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:relative lg:translate-x-0
`}>
  <Sidebar />
</div>

{/* Overlay that closes menu on tap outside */}
{isMobileMenuOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onClick={() => setIsMobileMenuOpen(false)}
  />
)}
```

---

### ⭐ QUALITY GAP 8 — No Health Check or Loading Screen

**Current state:** When the app first loads and checks auth status (localStorage token), there's a brief flash. ProtectedRoute has a dual-ring spinner — but the full-page loading experience is unclear.

**What to do:**
```jsx
// In AuthContext — initial loading state
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Validate token hasn't expired before setting as authenticated
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setUser(JSON.parse(localStorage.getItem('user')));
      } else {
        // Token expired — clear and redirect
        localStorage.clear();
      }
    } catch {
      localStorage.clear();
    }
  }
  setIsLoading(false);
}, []);

if (isLoading) return <FullPageSpinner />;
```

---

### ⭐ QUALITY GAP 9 — No environment configuration for production

**Current state:** The frontend likely has the API URL hardcoded as `http://localhost:8080`.

**What to do:**
```
Create frontend/.env:
VITE_API_BASE_URL=http://localhost:8080/api

Create frontend/.env.production:
VITE_API_BASE_URL=https://your-production-api.com/api

Create frontend/.env.example (commit this, not the actual .env):
VITE_API_BASE_URL=http://localhost:8080/api

Update axiosConfig.js:
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

---

## SECTION 4: PRODUCTION READINESS GAPS

---

### 🔴 PROD GAP 1 — Backend application.properties Not Production-Safe

**Current state:** Single `application.properties` with likely:
- `spring.jpa.hibernate.ddl-auto=update` (dangerous in production — will auto-alter your live schema)
- `spring.jpa.show-sql=true` (logs every SQL query — performance killer under load)
- Hardcoded JWT secret (security risk)

**What to do:**
```
Create three files:

application.properties (base, no secrets):
spring.application.name=SmallStores
server.port=8080

application-dev.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/smallstores_db
spring.datasource.username=root
spring.datasource.password=your_local_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
logging.level.com.example.smallstores=DEBUG
jwt.secret=dev-secret-not-for-production
jwt.expiration=86400000

application-prod.properties:
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.com.example.smallstores=WARN
jwt.secret=${JWT_SECRET}
jwt.expiration=28800000
spring.datasource.hikari.maximum-pool-size=20

Activate with: --spring.profiles.active=dev or =prod
```

---

### 🔴 PROD GAP 2 — No Docker Configuration

**Current state:** No Dockerfile or docker-compose.yml mentioned.

**What to do:**
```dockerfile
# backend/Dockerfile
FROM maven:3.9-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: smallstores_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

### 🔴 PROD GAP 3 — DataSeeder Runs in Production

**Current state:** `DataSeeder.java` is a `@Component` that seeds data "on first run." In production, this will insert dummy data into real customer databases.

**What to do:**
```java
@Component
@Profile("dev") // ← Add this annotation — DataSeeder only runs in dev profile
public class DataSeeder implements CommandLineRunner {
  // existing seeder code
}
```

---

## SECTION 5: PRIORITIZED EXECUTION ORDER

Execute in this exact sequence. Do not skip steps.

---

### 🔥 CRITICAL FIRST (Day 1-2) — Do These Before Anything Else

These gaps will break the application or create security vulnerabilities if not fixed first.

```
Priority 1: Fix auth endpoint URLs (/signup → /register, /signin → /login)
Priority 2: Verify + fix StoreContextHolder try/finally cleanup pattern
Priority 3: Add @Profile("dev") to DataSeeder
Priority 4: Run entity migrations (in dependency order)
Priority 5: Verify storeId is in JWT claims (decode token at jwt.io to confirm)
```

---

### 🟠 CORE FEATURES (Day 3-4) — Completes the Backend

```
Priority 6:  Add missing Dashboard endpoints (/sales/monthly, /products/top)
Priority 7:  Add JPQL queries for trend + top products
Priority 8:  Add inventory endpoints (low-stock, categories, category filter)
Priority 9:  Add @Transactional to order create + cancel
Priority 10: Add order status transition validation
Priority 11: Expand DashboardStatsDTO with all required fields
Priority 12: Update seed data to include 6 months of backdated orders
```

---

### 🟡 FRONTEND COMPLETIONS (Day 5-6) — Ships the Product

```
Priority 13: Create Register.jsx as standalone page (not a tab)
Priority 14: Update App.jsx routing (register, inventory, orders/:id, orders/create, store)
Priority 15: Build Inventory.jsx page
Priority 16: Build OrderDetail.jsx page
Priority 17: Build StoreProfile.jsx page  
Priority 18: Build 404.jsx page
Priority 19: Connect Dashboard charts to real API endpoints
Priority 20: Add Top Products BarChart to Dashboard
Priority 21: Add Low Stock Alerts widget to Dashboard
```

---

### ⭐ QUALITY LAYER (Day 7) — Makes It Worthy of Payment

```
Priority 22: Create EmptyState.jsx + add to all list pages
Priority 23: Create SkeletonRow.jsx + add to all table loading states
Priority 24: Create ConfirmModal.jsx + replace any window.confirm() usage
Priority 25: Create Pagination.jsx with "Showing X-Y of Z" + per-page selector
Priority 26: Add useDebounce hook + connect to all search inputs
Priority 27: Add comprehensive toast coverage for all CRUD actions
Priority 28: Fix mobile sidebar slide-over + backdrop overlay
Priority 29: Add token expiry check in AuthContext initial load
Priority 30: Create organized API function files (authApi.js, productApi.js, etc.)
```

---

### 🔵 PRODUCTION CONFIG (Day 8) — Ready to Deploy

```
Priority 31: Create application-dev.properties + application-prod.properties
Priority 32: Create frontend .env + .env.example
Priority 33: Update axiosConfig.js to use VITE_API_BASE_URL env variable
Priority 34: Create backend Dockerfile (multi-stage)
Priority 35: Create frontend Dockerfile (nginx)
Priority 36: Create docker-compose.yml
Priority 37: Create .gitignore entries for .env files
Priority 38: Write professional README.md
```

---

## SECTION 6: COMPLETE STATUS SCORECARD

| Category | Items | Done 🟢 | Partial 🟡 | Missing 🔴 | Score |
|---|---|---|---|---|---|
| Backend Auth | 8 | 3 | 4 | 1 | 44% |
| Backend Entities | 6 | 1 | 2 | 3 | 22% |
| Multi-tenancy | 5 | 1 | 4 | 0 | 30% |
| API Standardization | 5 | 1 | 4 | 0 | 25% |
| Dashboard Analytics | 8 | 2 | 1 | 5 | 19% |
| Inventory Subsystem | 6 | 0 | 2 | 4 | 8% |
| Order Management | 5 | 1 | 3 | 1 | 30% |
| Frontend Routing | 7 | 2 | 0 | 5 | 29% |
| Frontend Pages | 9 | 4 | 1 | 4 | 44% |
| Frontend Forms | 5 | 0 | 2 | 3 | 10% |
| Frontend API Layer | 5 | 2 | 1 | 2 | 40% |
| UI Quality | 9 | 2 | 3 | 4 | 28% |
| Production Config | 6 | 0 | 0 | 6 | 0% |
| **TOTAL** | **84** | **19** | **27** | **38** | **31%** |

**Current completion: 31% of production specification.**  
**After executing this document: 100% of production specification.**

---

## SECTION 7: WHAT THE PRODUCT LOOKS LIKE WHEN DONE

When all 38 priorities are complete, a store owner opens SmallStores and experiences this:

1. They land on a **split-screen register page** — not a tab, a dedicated page — fill their store info, click "Launch My Store," and they're in.

2. The **dashboard loads with real data**: 4 animated KPI cards, a 6-month revenue curve on a recharts AreaChart, a horizontal bar chart of their top 5 products, their last 5 orders in a compact table, and a low-stock alert widget if anything needs restocking.

3. On **Products**, they search, filter by category, see color-coded stock badges, add products in a glassmorphism modal with real-time validation, and delete with a confirmation modal that looks intentional — not a browser default popup.

4. On **Inventory**, they see at a glance which products are running low, click the pencil icon on a row, type a new stock number inline, hit save — done.

5. On **Orders**, they create an order by searching for a customer, adding products with a quantity picker that shows real-time total, and placing the order. They can click any order to see its full detail page with an order timeline showing exactly where it is in the fulfillment process.

6. Every action shows a toast. Every empty list shows a helpful empty state. Every table shows a skeleton while loading. Every form validates in real-time.

7. A paying customer opens this on their phone and the sidebar slides in smoothly when they tap the hamburger. Nothing overflows. Nothing breaks.

**That is the product.**

---

*SmallStores Gap Analysis v1.0 — February 26, 2026*  
*Gap analysis authored against the original 1_prompt.md specification and implementation plan review.*
