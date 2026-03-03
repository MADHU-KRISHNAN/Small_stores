# Platform Role-Based Access — Build Prompt

## System Overview

Build a multi-role e-commerce platform with two distinct user types: **Admins** and **Customers**. Each role has a completely separate login flow, dashboard, and set of permissions.

---

## Role Definitions

### 1. Admin

- Admins are store managers responsible for running their store on the platform.
- Each admin belongs to a specific store.
- Admins log in through a dedicated **Admin Login Portal** (`/admin/login`).
- Upon login, admins are redirected to the **Admin Dashboard**.

**Admin Capabilities:**
- Add, edit, and delete products in their store inventory
- Manage stock levels and product availability
- View and update product details (name, description, price, images, category, stock quantity)
- View and manage orders placed for their store products
- Mark orders as processed, shipped, or completed
- Manage their store profile (store name, description, logo, contact info)
- Cannot access other stores data or customer account details

---

### 2. Customer

- Customers are end-users who browse and purchase products from stores on the platform.
- Customers log in through a dedicated **Customer Login Portal** (`/login`).
- Upon login, customers are redirected to the **Customer Product Feed**.

**Customer Capabilities:**
- View all products listed across all stores on the platform
- Filter and search products by name, category, store, or price range
- View individual product detail pages (name, description, price, store name, availability)
- Add products to a cart or wishlist
- Place orders and view their own order history
- Manage their account profile
- Cannot access any admin or inventory management screens

---

## Authentication and Security Requirements

- Admin and Customer accounts are stored in **separate authentication tables**.
- JWT tokens must encode the users role (admin or customer).
- All admin routes must be protected by an isAdmin middleware/guard.
- All customer routes must be protected by an isCustomer middleware/guard.
- Admins attempting to access customer routes must be redirected and denied.
- Passwords must be hashed using bcrypt or equivalent.
- Implement independent logout for both roles.

---

## UI/UX Flows

### Admin Flow



### Customer Flow



---

## Product Feed (Customer View)

- Aggregates and displays **all active products from all stores** on the platform.
- Each product card must show:
  - Product image, name, and price
  - Store name (linked to the stores public page)
  - Availability status: In Stock / Out of Stock
- Support pagination or infinite scroll.
- Include a search bar and filter panel (by category, price range, store).
- Products marked as inactive by an admin must be hidden from the feed.

---

## Database Schema (High-Level)



---

## Role Separation Rules

| Feature                       | Admin          | Customer |
|-------------------------------|----------------|----------|
| Login Portal                  | /admin/login   | /login   |
| View all platform products    | No             | Yes      |
| Add / Edit / Delete products  | Yes            | No       |
| Manage inventory and stock    | Yes            | No       |
| Place orders                  | No             | Yes      |
| View store orders             | Yes            | No       |
| View own order history        | No             | Yes      |
| Manage store profile          | Yes            | No       |
| Access admin dashboard        | Yes            | No       |

---

## Implementation Notes

1. Use **separate login pages** — do not share a single login form with a role selector.
2. **Validate tokens on every protected request** — decode JWT and verify role server-side.
3. The **customer product feed** pulls from a single /api/products endpoint joining across all stores filtered by is_active = true.
4. **Admin inventory routes** filter by store_id tied to the authenticated admin — admins never see other stores products.
5. **Order visibility** — admins see orders for their store only; customers see their own orders only.
