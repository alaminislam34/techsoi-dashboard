const BASE_URL = "https://api.techsoibd.com/api";

// --- Auth & Profile ---
export const ADMIN_LOGIN_API = `${BASE_URL}/admin/login`;
export const ADMIN_LOGOUT_API = `${BASE_URL}/admin/logout`;
export const ADMIN_PROFILE_API = `${BASE_URL}/admin/profile`;

// --- User Management ---
export const GET_ALL_USERS_API = `${BASE_URL}/users`;

// --- Order Management ---
export const ORDER_API = `${BASE_URL}/order`; // Get all / Post
export const SINGLE_ORDER_API = (id) => `${BASE_URL}/order/${id}`; // Get/Put/Delete
export const ORDER_DETAILS_API = (id) => `${BASE_URL}/order-details/${id}`; // Put/Delete

// --- Product Management ---
export const PRODUCT_API = `${BASE_URL}/product`; // Get all / Post
export const PRODUCT_SINGLE_API = (id) => `${BASE_URL}/product/${id}`; // Get/Put/Delete
export const PRODUCT_LIMIT_API = (limit) =>
  `${BASE_URL}/product-limit/${limit}`;
export const PRODUCT_DETAILS_MANAGE_API = (id) =>
  `${BASE_URL}/product-details/${id}`;

// --- Category Management ---
export const CATEGORY_API = `${BASE_URL}/category`; // Get all / Post
export const CATEGORY_SINGLE_API = (id) => `${BASE_URL}/category/${id}`; // Get/Put/Delete
export const CATEGORY_LIMIT_API = (limit) =>
  `${BASE_URL}/category-limit/${limit}`;

// --- Sub-Category Management ---
export const SUB_CATEGORY_API = `${BASE_URL}/sub-category`; // Get all / Post
export const SUB_CATEGORY_SINGLE_API = (id) => `${BASE_URL}/sub-category/${id}`; // Get/Put/Delete

// --- Brand Management ---
export const BRAND_API = `${BASE_URL}/brand`; // Get all / Post
export const BRAND_SINGLE_API = (id) => `${BASE_URL}/brand/${id}`; // Get/Put/Delete
export const BRAND_LIMIT_API = (limit) => `${BASE_URL}/brand-limit/${limit}`;

// --- Banner / Hero Image Management ---
export const BANNER_API = `${BASE_URL}/hero-image`; // Get all / Post
export const BANNER_SINGLE_API = (id) => `${BASE_URL}/hero-image/${id}`; // Delete
export const BANNER_LIMIT_API = (limit) =>
  `${BASE_URL}/hero-image-limit/${limit}`;

// --- Blog Management ---
export const BLOG_API = `${BASE_URL}/blog`; // Get all / Post
export const BLOG_SINGLE_API = (id) => `${BASE_URL}/blog/${id}`; // Get/Put/Delete
export const BLOG_LIMIT_API = (limit) => `${BASE_URL}/blog-limit/${limit}`;

// --- Review Management ---
export const REVIEW_API = `${BASE_URL}/review-product`; // Get all
export const REVIEW_SINGLE_API = (id) => `${BASE_URL}/review-product/${id}`; // Get/Put/Delete
