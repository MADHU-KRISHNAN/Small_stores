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
 *   role: String,           // "ADMIN" or "STORE_OWNER"
 *   storeId: Long,          // extracted from JWT custom claim
 *   storeName: String       // store display name
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
