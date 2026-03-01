# SmallStores — Store Profile Page
## Complete End-to-End AI Code Editor Build Prompt
### Seniority Level: 15 Years | Production Standard | Zero Placeholders Allowed

---

## READ THIS FIRST — NON-NEGOTIABLE RULES

You are a **senior full-stack engineer**. Every file you generate must be **complete** — no `// TODO`, no `// implement later`, no placeholder comments, no partial logic. If you generate a service method, it has full logic. If you generate a component, it has full JSX, full state management, full error handling. Incomplete code is worse than no code — it creates silent bugs that take hours to find.

**Every single requirement in this document must be implemented. Not most. All.**

---

## PROJECT CONTEXT — WHAT ALREADY EXISTS

You are working inside **SmallStores**, a production multi-tenant SaaS for retail store management.

**Backend Stack:**
- Spring Boot 3.x, Java 17, Maven
- Spring Security + JWT authentication
- Spring Data JPA + MySQL
- Lombok for boilerplate reduction
- Base package: `com.example.smallstores`
- JWT tokens carry a custom claim `storeId`
- `StoreContextHolder.java` (ThreadLocal) holds the authenticated store's ID — every service method reads `StoreContextHolder.getStoreId()` for tenant isolation. Never accept storeId from request body or path variable.
- All controllers return `ResponseEntity<ApiResponse<T>>` — the `ApiResponse<T>` wrapper is already built at `com.example.smallstores.dto.ApiResponse`
- All custom exceptions are in `com.example.smallstores.exception` — `GlobalExceptionHandler.java` handles them all
- `UserRepository`, `StoreRepository`, `ProductRepository`, `CustomerRepository`, `OrderRepository` all exist

**Frontend Stack:**
- React 18, Vite, React Router v6
- Tailwind CSS with custom dark design system already configured
- Axios instance at `src/api/axiosConfig.js` — baseURL is `http://localhost:8080/api`, JWT is auto-attached via request interceptor
- `AuthContext` at `src/context/AuthContext.jsx` — exposes `{ user: { token, username, role, storeId, storeName }, login(userData), logout() }`
- `react-hot-toast` is installed — `<Toaster>` is in `App.jsx`
- `react-hook-form` + `yup` + `@hookform/resolvers` are installed
- `@heroicons/react` is installed — use `heroicons/react/24/outline` imports
- Existing CSS utility classes in `src/index.css`: `glass-card`, `input-dark`, `btn-primary`, `btn-ghost`, `btn-danger`, `badge-success`, `badge-warning`, `badge-danger`
- Design system: background `#0f172a`, surface `#1e293b`, accent violet `#8b5cf6`, text primary `white`, text secondary `slate-400`
- All other pages (Dashboard, Products, Customers, Orders) already exist and use `Layout.jsx` as the wrapper shell

**The Store Profile page does NOT exist.** You are building it entirely — every file, every line, zero gaps.

---

## WHAT YOU ARE BUILDING

Route: `/store`
Page: **Store Profile**
Access: Authenticated `STORE_OWNER` only

This page has **three functional sections:**

1. **Store Information Panel** — view + edit store details (storeName, ownerName, phone, address)
2. **Security Panel** — change account password (currentPassword → newPassword with confirmation)
3. **Store Stats Panel** — read-only summary cards (totalProducts, totalCustomers, totalOrders, memberSince)

All three sections live on the same page. Store info and security are each independently editable — clicking Edit on one does not affect the other. Stats are always read-only and pull live data from the backend.

---

## BACKEND — BUILD THESE FILES IN THIS EXACT ORDER

---

### FILE 1 — Update `Store.java` Entity

Location: `src/main/java/com/example/smallstores/entity/Store.java`

Ensure ALL of the following fields exist on the entity. Add any that are missing. Do not remove existing fields:

```java
@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "email", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

**After updating this entity:** verify `spring.jpa.hibernate.ddl-auto=update` is set in `application-dev.properties`, start the application once, and confirm via MySQL that columns `owner_name`, `is_active`, `created_at`, `updated_at` exist in the `stores` table before continuing.

---

### FILE 2 — `StoreProfileResponseDTO.java`

Location: `src/main/java/com/example/smallstores/dto/StoreProfileResponseDTO.java`

This DTO is returned to the frontend when the profile page loads. It combines store data + user account data + live statistics in a single response so the frontend makes exactly ONE API call to render the entire page.

```java
package com.example.smallstores.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreProfileResponseDTO {

    // Store identity
    private Long storeId;
    private String storeName;
    private String ownerName;
    private String email;           // display only — not editable
    private String phone;
    private String address;
    private Boolean isActive;

    // Account identity
    private String username;        // display only — not editable

    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Live statistics (aggregated at query time)
    private Long totalProducts;
    private Long totalCustomers;
    private Long totalOrders;
}
```

---

### FILE 3 — `UpdateStoreProfileRequestDTO.java`

Location: `src/main/java/com/example/smallstores/dto/UpdateStoreProfileRequestDTO.java`

```java
package com.example.smallstores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStoreProfileRequestDTO {

    @NotBlank(message = "Store name is required")
    @Size(min = 2, max = 100, message = "Store name must be between 2 and 100 characters")
    private String storeName;

    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100, message = "Owner name must be between 2 and 100 characters")
    private String ownerName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @Size(max = 300, message = "Address must not exceed 300 characters")
    private String address;
}
```

---

### FILE 4 — `ChangePasswordRequestDTO.java`

Location: `src/main/java/com/example/smallstores/dto/ChangePasswordRequestDTO.java`

```java
package com.example.smallstores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters")
    private String newPassword;

    @NotBlank(message = "Please confirm your new password")
    private String confirmPassword;
}
```

---

### FILE 5 — `StoreService.java` Interface

Location: `src/main/java/com/example/smallstores/service/StoreService.java`

If this file already exists, add the missing method signatures. Do not remove existing ones.

```java
package com.example.smallstores.service;

import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;

public interface StoreService {

    StoreProfileResponseDTO getMyStoreProfile();

    StoreProfileResponseDTO updateStoreProfile(UpdateStoreProfileRequestDTO request);

    void changePassword(ChangePasswordRequestDTO request);
}
```

---

### FILE 6 — `StoreServiceImpl.java`

Location: `src/main/java/com/example/smallstores/service/impl/StoreServiceImpl.java`

If this file already exists, integrate the new methods. If it does not exist, create it fully. This is the most complex backend file — implement every method completely with all business rules.

```java
package com.example.smallstores.service.impl;

import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;
import com.example.smallstores.entity.Store;
import com.example.smallstores.entity.User;
import com.example.smallstores.exception.ResourceNotFoundException;
import com.example.smallstores.exception.UnauthorizedAccessException;
import com.example.smallstores.repository.CustomerRepository;
import com.example.smallstores.repository.OrderRepository;
import com.example.smallstores.repository.ProductRepository;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.repository.UserRepository;
import com.example.smallstores.security.StoreContextHolder;
import com.example.smallstores.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public StoreProfileResponseDTO getMyStoreProfile() {
        Long storeId = StoreContextHolder.getStoreId();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found for id: " + storeId));

        User user = getCurrentUser();

        // Aggregate live statistics in a single pass — do NOT make 3 separate service calls
        Long totalProducts = productRepository.countByStoreIdAndIsActiveTrue(storeId);
        Long totalCustomers = customerRepository.countByStoreId(storeId);
        Long totalOrders = orderRepository.countByStoreId(storeId);

        return StoreProfileResponseDTO.builder()
                .storeId(store.getId())
                .storeName(store.getStoreName())
                .ownerName(store.getOwnerName())
                .email(store.getEmail())
                .phone(store.getPhone())
                .address(store.getAddress())
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .username(user.getUsername())
                .totalProducts(totalProducts != null ? totalProducts : 0L)
                .totalCustomers(totalCustomers != null ? totalCustomers : 0L)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .build();
    }

    @Override
    @Transactional
    public StoreProfileResponseDTO updateStoreProfile(UpdateStoreProfileRequestDTO request) {
        Long storeId = StoreContextHolder.getStoreId();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found for id: " + storeId));

        // Apply only the editable fields — email is immutable, never touch it
        store.setStoreName(request.getStoreName().trim());
        store.setOwnerName(request.getOwnerName().trim());

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            store.setPhone(request.getPhone().trim());
        }

        if (request.getAddress() != null) {
            store.setAddress(request.getAddress().trim());
        }

        storeRepository.save(store);

        // Return the updated full profile
        return getMyStoreProfile();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequestDTO request) {
        // Validate confirm password matches before touching the database
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new UnauthorizedAccessException("New password and confirm password do not match");
        }

        // Reject if new password is the same as current password
        User user = getCurrentUser();
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new UnauthorizedAccessException("New password must be different from current password");
        }

        // Verify current password is correct before allowing change
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Private helper — resolves the User entity for the currently authenticated principal
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
```

---

### FILE 7 — Update Repository `countBy` Methods

Open each repository and add the count methods that `StoreServiceImpl` depends on. Add only the missing ones — do not duplicate existing methods.

**`ProductRepository.java`** — add if missing:
```java
Long countByStoreIdAndIsActiveTrue(Long storeId);
```

**`CustomerRepository.java`** — add if missing:
```java
Long countByStoreId(Long storeId);
```

**`OrderRepository.java`** — add if missing:
```java
Long countByStoreId(Long storeId);
```

These are Spring Data JPA derived query methods — no `@Query` annotation needed. Spring generates the SQL automatically.

---

### FILE 8 — `StoreController.java`

Location: `src/main/java/com/example/smallstores/controller/StoreController.java`

If this file already exists, add the missing endpoints. If it does not exist, create it fully. Every endpoint must use `ApiResponse<T>` wrapper.

```java
package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;
import com.example.smallstores.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    /**
     * GET /api/store/profile
     * Returns the complete store profile for the currently authenticated store owner.
     * Includes store details, account info, and live statistics.
     * Access: STORE_OWNER only
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreProfileResponseDTO>> getMyProfile() {
        StoreProfileResponseDTO profile = storeService.getMyStoreProfile();
        return ResponseEntity.ok(ApiResponse.success(profile, "Store profile loaded successfully"));
    }

    /**
     * PUT /api/store/profile
     * Updates editable store information fields.
     * Email and username are immutable — any attempt to change them is silently ignored (not rejected).
     * Access: STORE_OWNER only
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreProfileResponseDTO>> updateMyProfile(
            @Valid @RequestBody UpdateStoreProfileRequestDTO request) {
        StoreProfileResponseDTO updated = storeService.updateStoreProfile(request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Store profile updated successfully"));
    }

    /**
     * PATCH /api/store/password
     * Changes the account password.
     * Requires current password verification before accepting the new password.
     * Access: STORE_OWNER only
     */
    @PatchMapping("/password")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        storeService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully. Please log in again."));
    }
}
```

---

### FILE 9 — Update `GlobalExceptionHandler.java`

Open `src/main/java/com/example/smallstores/exception/GlobalExceptionHandler.java`.

Confirm `UnauthorizedAccessException` is handled with HTTP 400 (not 403) when used for business logic validation like password mismatch — 403 is for access control, 400 is for bad input. The exception is already in the codebase — just verify the HTTP status is `BAD_REQUEST` for password validation errors.

If `UnauthorizedAccessException` currently maps to 403 and you need a separate exception for business rule violations, create `BusinessValidationException.java` with this structure:

```java
package com.example.smallstores.exception;

public class BusinessValidationException extends RuntimeException {
    public BusinessValidationException(String message) {
        super(message);
    }
}
```

Then in `GlobalExceptionHandler`:
```java
@ExceptionHandler(BusinessValidationException.class)
public ResponseEntity<ApiResponse<Void>> handleBusinessValidation(BusinessValidationException ex) {
    return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
}
```

And update `StoreServiceImpl.changePassword()` to throw `BusinessValidationException` for password mismatch and same-password errors, reserving `UnauthorizedAccessException` only for wrong current password (which is a 401-class issue).

---

### BACKEND VERIFICATION CHECKLIST

Before touching the frontend, verify every one of these manually via Postman or curl:

```
Step 1 — Get a valid JWT token:
POST http://localhost:8080/api/auth/login
Body: { "username": "your_username", "password": "your_password" }
Copy the token from response.

Step 2 — Load profile (GET):
GET http://localhost:8080/api/store/profile
Header: Authorization: Bearer {token}
Expected: HTTP 200, response.data contains storeId, storeName, ownerName, email,
          username, totalProducts, totalCustomers, totalOrders, createdAt
FAIL if: 403, 404, 500, or missing any field listed above

Step 3 — Update profile (PUT):
PUT http://localhost:8080/api/store/profile
Header: Authorization: Bearer {token}
Body: { "storeName": "Updated Store", "ownerName": "New Owner", "phone": "9876543210", "address": "123 Main St" }
Expected: HTTP 200, response.data.storeName equals "Updated Store"
FAIL if: 400 validation error, 403, 500

Step 4 — Validation rejection:
PUT http://localhost:8080/api/store/profile
Body: { "storeName": "", "ownerName": "Valid Owner" }
Expected: HTTP 400, response.errors.storeName = "Store name is required"
FAIL if: HTTP 200 (update succeeded with empty name)

Step 5 — Change password:
PATCH http://localhost:8080/api/store/password
Body: { "currentPassword": "correct_password", "newPassword": "newpass123", "confirmPassword": "newpass123" }
Expected: HTTP 200, success message
FAIL if: 400 or 500

Step 6 — Wrong current password:
PATCH http://localhost:8080/api/store/password
Body: { "currentPassword": "WRONG", "newPassword": "newpass123", "confirmPassword": "newpass123" }
Expected: HTTP 400, error message "Current password is incorrect"
FAIL if: HTTP 200 (password changed with wrong current password — critical security bug)

Step 7 — Password mismatch:
PATCH http://localhost:8080/api/store/password
Body: { "currentPassword": "correct", "newPassword": "abc12345", "confirmPassword": "abc99999" }
Expected: HTTP 400, error message about password mismatch
FAIL if: HTTP 200
```

**Do not proceed to frontend until all 7 backend checks pass.**

---

## FRONTEND — BUILD THESE FILES IN THIS EXACT ORDER

---

### FILE 10 — `src/api/storeApi.js`

Create this file. All API calls for the store profile page live here — no inline axios calls in components.

```javascript
import axios from './axiosConfig';

/**
 * Fetches the complete store profile including stats.
 * Maps to: GET /api/store/profile
 */
export const getStoreProfile = () => axios.get('/store/profile');

/**
 * Updates editable store fields.
 * Maps to: PUT /api/store/profile
 * @param {Object} data - { storeName, ownerName, phone, address }
 */
export const updateStoreProfile = (data) => axios.put('/store/profile', data);

/**
 * Changes the account password.
 * Maps to: PATCH /api/store/password
 * @param {Object} data - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = (data) => axios.patch('/store/password', data);
```

---

### FILE 11 — `src/utils/validationSchemas.js`

If this file already exists, ADD the store schemas to it. Do not overwrite existing schemas.

```javascript
import * as yup from 'yup';

// Add these exports to the existing file:

export const updateStoreProfileSchema = yup.object({
  storeName: yup
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name cannot exceed 100 characters')
    .required('Store name is required'),

  ownerName: yup
    .string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name cannot exceed 100 characters')
    .required('Owner name is required'),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .nullable()
    .transform((value) => value === '' ? null : value),

  address: yup
    .string()
    .max(300, 'Address cannot exceed 300 characters')
    .nullable()
    .transform((value) => value === '' ? null : value),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),

  newPassword: yup
    .string()
    .min(8, 'New password must be at least 8 characters')
    .required('New password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});
```

---

### FILE 12 — `src/pages/store/StoreProfile.jsx`

This is the main page file. Build it completely. This is the most complex frontend file — no section can be stubbed or skipped.

**Architecture decisions before writing a single line:**
- The page has 3 visual panels: Store Info, Security, Stats
- Store Info panel has two modes: **view mode** and **edit mode** — toggled by clicking "Edit Profile"
- Security panel is always in edit mode (it's a form, not a display)
- Stats panel is always read-only
- One `useEffect` on mount fetches the profile — single API call populates everything
- Two separate `useForm` instances — one for store info, one for password change — completely independent
- `isStoreEditMode` state boolean controls the Store Info panel toggle
- A separate `isPasswordLoading` state tracks the password form submission independently from the store info form

**Build the complete file:**

```jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  PencilSquareIcon,
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  CubeIcon,
  UsersIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import { getStoreProfile, updateStoreProfile, changePassword } from '../../api/storeApi';
import { updateStoreProfileSchema, changePasswordSchema } from '../../utils/validationSchemas';

// ─── Sub-component: StatCard ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Sub-component: FieldDisplay ─────────────────────────────────────────────
const FieldDisplay = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-white font-medium">{value || <span className="text-slate-500 italic">Not set</span>}</p>
  </div>
);

// ─── Sub-component: FormInput ────────────────────────────────────────────────
const FormInput = ({ label, name, register, error, type = 'text', placeholder, rightElement }) => (
  <div>
    <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
    <div className="relative">
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={`input-dark w-full ${error ? 'border-red-500 focus:border-red-400' : ''} ${rightElement ? 'pr-12' : ''}`}
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
  </div>
);

// ─── Sub-component: SectionHeader ────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="glass-card p-6">
      <div className="h-5 w-32 bg-slate-700 rounded mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="h-3 w-20 bg-slate-700 rounded mb-2" />
            <div className="h-5 w-full bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
    <div className="glass-card p-6">
      <div className="h-5 w-40 bg-slate-700 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-slate-700 rounded" />
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StoreProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreEditMode, setIsStoreEditMode] = useState(false);
  const [isStoreSaving, setIsStoreSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Store info form — pre-populated when profile loads
  const storeForm = useForm({
    resolver: yupResolver(updateStoreProfileSchema),
    mode: 'onChange',
  });

  // Password form — always starts empty
  const passwordForm = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onChange',
  });

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const res = await getStoreProfile();
        const data = res.data.data;
        setProfile(data);

        // Pre-populate the store info form with current values
        storeForm.reset({
          storeName: data.storeName || '',
          ownerName: data.ownerName || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load store profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ── Handle store info save ─────────────────────────────────────────────────
  const handleStoreSave = storeForm.handleSubmit(async (formData) => {
    try {
      setIsStoreSaving(true);
      const res = await updateStoreProfile(formData);
      const updated = res.data.data;
      setProfile(updated);

      // Sync form with fresh server values
      storeForm.reset({
        storeName: updated.storeName || '',
        ownerName: updated.ownerName || '',
        phone: updated.phone || '',
        address: updated.address || '',
      });

      setIsStoreEditMode(false);
      toast.success('Store profile updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsStoreSaving(false);
    }
  });

  // ── Handle store edit cancel ───────────────────────────────────────────────
  const handleStoreCancel = () => {
    // Reset form back to last known good server values
    storeForm.reset({
      storeName: profile?.storeName || '',
      ownerName: profile?.ownerName || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setIsStoreEditMode(false);
  };

  // ── Handle password change ─────────────────────────────────────────────────
  const handlePasswordChange = passwordForm.handleSubmit(async (formData) => {
    try {
      setIsPasswordSaving(true);
      await changePassword(formData);
      passwordForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast.success('Password changed successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsPasswordSaving(false);
    }
  });

  // ── Handle store ID copy ───────────────────────────────────────────────────
  const handleCopyStoreId = () => {
    if (!profile?.storeId) return;
    navigator.clipboard.writeText(String(profile.storeId)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Format date for display ────────────────────────────────────────────────
  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6">
        <div className="mb-8">
          <div className="h-7 w-40 bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6 flex flex-col items-center justify-center min-h-64">
        <BuildingStorefrontIcon className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg font-medium">Could not load store profile</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Store Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your store details and account security
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN (2/3 width on xl) ──────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* ── Store Information Panel ────────────────────────────────────── */}
          <div className="glass-card p-6">
            <SectionHeader
              icon={BuildingStorefrontIcon}
              title="Store Information"
              subtitle="Your store's public and contact details"
              action={
                !isStoreEditMode ? (
                  <button
                    onClick={() => setIsStoreEditMode(true)}
                    className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 
                               transition-colors font-medium"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : null
              }
            />

            {/* VIEW MODE */}
            {!isStoreEditMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldDisplay label="Store Name" value={profile.storeName} />
                <FieldDisplay label="Owner Name" value={profile.ownerName} />
                <FieldDisplay label="Registered Email" value={profile.email} />
                <FieldDisplay label="Phone Number" value={profile.phone} />
                <div className="sm:col-span-2">
                  <FieldDisplay label="Address" value={profile.address} />
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {isStoreEditMode && (
              <form onSubmit={handleStoreSave} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Store Name *"
                    name="storeName"
                    register={storeForm.register}
                    error={storeForm.formState.errors.storeName}
                    placeholder="Your store name"
                  />
                  <FormInput
                    label="Owner Name *"
                    name="ownerName"
                    register={storeForm.register}
                    error={storeForm.formState.errors.ownerName}
                    placeholder="Full name"
                  />

                  {/* Immutable email — shown as disabled, not editable */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">
                      Registered Email
                      <span className="ml-2 text-xs text-slate-600">(cannot be changed)</span>
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="input-dark w-full opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <FormInput
                    label="Phone Number"
                    name="phone"
                    register={storeForm.register}
                    error={storeForm.formState.errors.phone}
                    placeholder="10-digit mobile number"
                  />

                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-400 mb-1.5">Address</label>
                    <textarea
                      {...storeForm.register('address')}
                      rows={3}
                      placeholder="Store address"
                      className={`input-dark w-full resize-none ${
                        storeForm.formState.errors.address ? 'border-red-500' : ''
                      }`}
                    />
                    {storeForm.formState.errors.address && (
                      <p className="text-red-400 text-xs mt-1">
                        {storeForm.formState.errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Mode Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
                  <button
                    type="submit"
                    disabled={isStoreSaving || !storeForm.formState.isDirty}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isStoreSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleStoreCancel}
                    disabled={isStoreSaving}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Security Panel ─────────────────────────────────────────────── */}
          <div className="glass-card p-6">
            <SectionHeader
              icon={LockClosedIcon}
              title="Change Password"
              subtitle="Update your account password. You'll stay logged in."
            />

            <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
              <FormInput
                label="Current Password *"
                name="currentPassword"
                register={passwordForm.register}
                error={passwordForm.formState.errors.currentPassword}
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(p => !p)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCurrentPassword
                      ? <EyeSlashIcon className="w-4 h-4" />
                      : <EyeIcon className="w-4 h-4" />
                    }
                  </button>
                }
              />

              <FormInput
                label="New Password *"
                name="newPassword"
                register={passwordForm.register}
                error={passwordForm.formState.errors.newPassword}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(p => !p)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword
                      ? <EyeSlashIcon className="w-4 h-4" />
                      : <EyeIcon className="w-4 h-4" />
                    }
                  </button>
                }
              />

              <FormInput
                label="Confirm New Password *"
                name="confirmPassword"
                register={passwordForm.register}
                error={passwordForm.formState.errors.confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword
                      ? <EyeSlashIcon className="w-4 h-4" />
                      : <EyeIcon className="w-4 h-4" />
                    }
                  </button>
                }
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPasswordSaving || !passwordForm.formState.isDirty}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPasswordSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT COLUMN (1/3 width on xl) ─────────────────────────────── */}
        <div className="space-y-6">

          {/* ── Store Statistics ───────────────────────────────────────────── */}
          <div className="glass-card p-6">
            <SectionHeader
              icon={CubeIcon}
              title="Store Overview"
              subtitle="Live summary of your store data"
            />
            <div className="space-y-4">
              <StatCard
                icon={CubeIcon}
                label="Total Products"
                value={profile.totalProducts?.toLocaleString()}
                color="bg-violet-500/30"
              />
              <StatCard
                icon={UsersIcon}
                label="Total Customers"
                value={profile.totalCustomers?.toLocaleString()}
                color="bg-emerald-500/30"
              />
              <StatCard
                icon={ShoppingCartIcon}
                label="Total Orders"
                value={profile.totalOrders?.toLocaleString()}
                color="bg-blue-500/30"
              />
            </div>
          </div>

          {/* ── Account Details ────────────────────────────────────────────── */}
          <div className="glass-card p-6">
            <SectionHeader
              icon={CalendarDaysIcon}
              title="Account Details"
              subtitle="Read-only account information"
            />
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Username</p>
                <p className="text-white font-medium font-mono">@{profile.username}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-white font-medium">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-white font-medium">{formatDate(profile.updatedAt)}</p>
              </div>

              {/* Store ID copy pill */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Store ID</p>
                <button
                  onClick={handleCopyStoreId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 
                             hover:bg-slate-700 border border-slate-700 hover:border-slate-600 
                             transition-all group w-full"
                >
                  <span className="text-slate-300 font-mono text-sm flex-1 text-left">
                    #{profile.storeId}
                  </span>
                  {copied ? (
                    <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 
                                                       flex-shrink-0 transition-colors" />
                  )}
                </button>
                <p className="text-xs text-slate-600 mt-1">
                  {copied ? 'Copied to clipboard!' : 'Click to copy for support'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
```

---

### FILE 13 — Update `src/App.jsx` Routing

Open `src/App.jsx`. Add the import and the route for StoreProfile. Do not disturb any existing routes.

**Add import** (with lazy loading — consistent with other page imports):
```javascript
import { lazy, Suspense } from 'react';
const StoreProfile = lazy(() => import('./pages/store/StoreProfile'));
```

**Add route** inside the protected routes block (alongside /dashboard, /products, etc.):
```jsx
<Route path="/store" element={<StoreProfile />} />
```

---

### FILE 14 — Update `src/components/Sidebar.jsx`

Open `Sidebar.jsx`. Find the navigation items array/list and add the Store Profile entry. Place it as the last item before Logout.

**Add this navigation item:**
```jsx
{
  path: '/store',
  label: 'Store Profile',
  icon: BuildingStorefrontIcon,   // from @heroicons/react/24/outline
}
```

Add the import at the top if not already present:
```javascript
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
```

The nav item must follow the exact same styling pattern as existing nav items: same padding, same active state logic (comparing `location.pathname` to `/store`), same hover state, same icon sizing.

---

## INTEGRATION VERIFICATION — FRONTEND

After building all frontend files, run this exact sequence manually in the browser:

```
Test 1 — Navigation:
Click "Store Profile" in the sidebar.
Expected: URL changes to /store. Page loads with data.
FAIL if: 404 page, blank page, or console error.

Test 2 — Data loaded correctly:
Verify all fields display correctly:
  - storeName, ownerName, email, phone, address all show server values
  - totalProducts, totalCustomers, totalOrders show real counts
  - Member Since shows formatted date (not raw ISO string)
  - Username shows with @ prefix
FAIL if: any field shows "undefined", "null", or raw ISO string.

Test 3 — Edit mode toggle:
Click "Edit Profile".
Expected: All fields convert to inputs pre-populated with current values.
Email field is present but visually disabled (not editable).
FAIL if: any input is empty when edit mode opens.

Test 4 — Save Changes button state:
Open edit mode. Do NOT change anything.
Expected: "Save Changes" button is disabled (no changes yet).
Change one field.
Expected: "Save Changes" button becomes enabled.
FAIL if: button is always enabled regardless of form state.

Test 5 — Validation in edit mode:
In edit mode, clear the Store Name field.
Expected: Inline red error "Store name is required" appears immediately.
Expected: "Save Changes" button is disabled.
FAIL if: error only shows after clicking Save, or button is still enabled.

Test 6 — Successful store info save:
In edit mode, change store name to "Test Store Updated".
Click "Save Changes".
Expected: Loading spinner appears on button.
Expected: Page exits edit mode.
Expected: View mode shows "Test Store Updated" as the store name.
Expected: Success toast "Store profile updated successfully" appears.
FAIL if: page stays in edit mode, or view mode shows old name.

Test 7 — Cancel edit mode:
In edit mode, change a field.
Click "Cancel".
Expected: Form returns to view mode with original values (not the changed values).
FAIL if: cancelled changes persist visually.

Test 8 — Password form validation:
Leave all password fields empty and click "Update Password".
Expected: Three inline errors appear (one per field).
FAIL if: errors don't appear or API call is made.

Test 9 — Password mismatch:
Fill currentPassword, newPassword, then type a different confirmPassword.
Expected: Real-time error "Passwords do not match" under confirmPassword.
FAIL if: error only shows on submit.

Test 10 — Wrong current password:
Submit password form with incorrect current password.
Expected: Error toast "Current password is incorrect".
Expected: Form is NOT cleared (user can correct and retry).
FAIL if: toast is generic, or form clears on error.

Test 11 — Successful password change:
Submit with correct current password and matching new passwords.
Expected: Loading spinner on button.
Expected: All three password fields clear on success.
Expected: Toast "Password changed successfully".
FAIL if: form doesn't clear, or no toast.

Test 12 — Eye toggle buttons:
Click eye icon on each password field.
Expected: Field type toggles between password and text.
FAIL if: clicking eye icon submits the form.

Test 13 — Store ID copy:
Click the Store ID pill in the right column.
Expected: Clipboard icon changes to a checkmark.
Expected: Text below changes to "Copied to clipboard!"
After 2 seconds: reverts back to original state.
FAIL if: clipboard API fails silently or icon doesn't change.

Test 14 — Loading state:
Hard refresh the /store page.
Expected: Skeleton loader appears while data loads.
Expected: Skeleton replaced by real data after API responds.
FAIL if: blank white flash or layout shift on load.

Test 15 — Responsive check:
Resize browser to 768px wide.
Expected: Left and right columns stack vertically.
Expected: Form inputs are full width.
Expected: No horizontal overflow.
FAIL if: layout breaks or overflows at tablet width.
```

**All 15 tests must pass before this feature is considered complete.**

---

## FINAL INTEGRATION CHECKLIST

```
BACKEND
[ ] Store entity has: ownerName, isActive, createdAt, updatedAt
[ ] MySQL columns confirmed after migration
[ ] StoreProfileResponseDTO has all 14 fields including stats
[ ] UpdateStoreProfileRequestDTO has correct validation annotations
[ ] ChangePasswordRequestDTO has correct validation annotations
[ ] StoreService interface has all 3 methods
[ ] StoreServiceImpl has complete logic (no placeholders) for all 3 methods
[ ] changePassword verifies current password BEFORE hashing new one
[ ] changePassword rejects when newPassword == confirmPassword mismatch
[ ] changePassword rejects when newPassword == currentPassword
[ ] Repository countBy methods added to all 3 repositories
[ ] StoreController has GET /api/store/profile
[ ] StoreController has PUT /api/store/profile
[ ] StoreController has PATCH /api/store/password
[ ] All 3 endpoints use @PreAuthorize("hasRole('STORE_OWNER')")
[ ] All 3 endpoints return ResponseEntity<ApiResponse<T>>
[ ] All 7 Postman verification tests passed

FRONTEND
[ ] src/api/storeApi.js created with 3 functions
[ ] Yup schemas added to validationSchemas.js
[ ] StoreProfile.jsx created — complete, no placeholder JSX
[ ] App.jsx routing updated — /store route added
[ ] Sidebar.jsx updated — Store Profile nav item added
[ ] All 15 browser tests passed
```

---

## WHAT DONE LOOKS LIKE

When this feature is complete, a store owner navigates to the Store Profile page and sees their store name, owner name, email, phone, and address in a clean view mode with an "Edit Profile" button. Clicking it converts each field into a pre-populated input. The email input is visually present but clearly disabled. They change the phone number, see the Save button activate, hit Save, watch the spinner, see the view mode update instantly, and get a success toast.

Below that, a password form with three fields and individual eye toggles. Real-time validation. Wrong current password gives a specific error toast, not "something went wrong."

On the right, three stat cards show live counts from their actual data — not hardcoded numbers. Their username, join date, last updated date, and a copyable store ID pill sit below.

Skeleton loaders on first load. No flash of empty content. Responsive on tablet. No console errors.

**That is production. That is what ships.**

---

*SmallStores — Store Profile Page Build Prompt v1.0*
*Standard: Production-grade | Zero placeholders | End-to-end complete*
