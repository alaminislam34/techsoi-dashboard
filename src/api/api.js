import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://api.techsoibd.com/api";

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = Cookies.get("admin_token");
    // Only attach token if it exists and we aren't hitting the login endpoint
    if (token && !config.url.includes("/admin/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Internal Server Error",
    };

    if (error.response?.status === 401) {
      Cookies.remove("admin_token");
      localStorage.removeItem("user");
      // Optional: window.location.href = "/login";
    }

    return Promise.reject(customError);
  },
);

export default apiService;
