// --- Auth & Profile ---
export const ADMIN_LOGIN_API = "/admin/login";
export const ADMIN_LOGOUT_API = "/admin/logout";
export const ADMIN_PROFILE_API = "/admin/profile";
export const ADMIN_PASSWORD_RESET_API = "/admin/password-reset";
// --- User Management ---
export const GET_ALL_USERS_API = "/users";

// --- Order Management ---
export const ORDER_API = "/order"; // Get all / Post
export const SINGLE_ORDER_API = (id) => `/order/${id}`; // Get/Put/Delete
export const ORDER_DETAILS_API = (id) => `/order-details/${id}`; // Put/Delete

// --- Product Management ---
export const PRODUCT_API = "/product"; // Get all / Post
export const PRODUCT_SINGLE_API = (id) => `/product/${id}`; // Get/Put/Delete
export const PRODUCT_SLUG_API = (slug) => `/product-details/${slug}`; // Get by slug
export const PRODUCT_SEARCH_API = (query) => `/product-search/${query}`;
export const PRODUCT_LIMIT_API = (limit) => `/product-limit/${limit}`;
export const PRODUCT_DETAILS_MANAGE_API = (id) => `/product-details/${id}`;
export const PRODUCT_DETAILS_API = "/product-details"; // Create

// --- Category Management ---
export const CATEGORY_API = "/category"; // Get all / Post
export const CATEGORY_SINGLE_API = (id) => `/category/${id}`; // Get/Put/Delete
export const CATEGORY_LIMIT_API = (limit) => `/category-limit/${limit}`;

// --- Sub-Category Management ---
export const SUB_CATEGORY_API = "/sub-category"; // Get all / Post
export const SUB_CATEGORY_SINGLE_API = (id) => `/sub-category/${id}`; // Get/Put/Delete

// --- Brand Management ---
export const BRAND_API = "/brand"; // Get all / Post
export const BRAND_SINGLE_API = (id) => `/brand/${id}`; // Get/Put/Delete
export const BRAND_LIMIT_API = (limit) => `/brand-limit/${limit}`;

export const SPECIAL_BRAND_API = "/special-brand"; // Get all / Post
export const SPECIAL_BRAND_SINGLE_API = (id) => `/special-brand/${id}`; // Get/Put/Delete
export const SPECIAL_BRAND_LIMIT_API = (limit) =>
  `/special-brand-limit/${limit}`;

// --- Banner / Hero Image Management ---
export const BANNER_API = "/hero-image"; // Get all / Post
export const BANNER_SINGLE_API = (id) => `/hero-image/${id}`; // Delete
export const BANNER_LIMIT_API = (limit) => `/hero-image-limit/${limit}`;

// --- Blog Management ---
export const BLOG_API = "/blog"; // Get all / Post
export const BLOG_SINGLE_API = (id) => `/blog/${id}`; // Get/Put/Delete
export const BLOG_LIMIT_API = (limit) => `/blog-limit/${limit}`;

// --- Review Management ---
export const REVIEW_API = "/review-product"; // Get all
export const REVIEW_SINGLE_API = (id) => `/review-product/${id}`; // Get/Put/Delete
