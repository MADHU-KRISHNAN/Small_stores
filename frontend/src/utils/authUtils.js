/**
 * FROZEN CONTRACT: AuthContext User Shape
 * 
 * DO NOT CHANGE THIS SHAPE MID-REFACTOR.
 * Every component, page, and hook must read from these exact keys.
 * 
 * Shape:
 * {
 *   token: String,          // JWT Bearer token
 *   username: String,       // login username
 *   role: String,           // "ADMIN", "STORE_OWNER", or "CUSTOMER"
 *   storeId: Long|null,     // extracted from JWT custom claim (null for customers)
 *   storeName: String|null  // store display name (null for customers)
 * }
 */
export const parseLoginResponse = (apiResponse) => {
    return {
        token: apiResponse.token,
        username: apiResponse.username,
        role: apiResponse.role,
        storeId: apiResponse.storeId,
        storeName: apiResponse.storeName
    };
};

export const isAdmin = (user) => user?.role === 'ADMIN' || user?.role === 'STORE_OWNER';
export const isCustomer = (user) => user?.role === 'CUSTOMER';
