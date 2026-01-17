import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://api.techsoibd.com/api";

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ১. Request Interceptor
apiService.interceptors.request.use(
  (config) => {
    if (!config.url.includes("/admin/login")) {
      const token = Cookies.get("admin_token");

      if (!token) {
        return Promise.reject({
          status: 401,
          message: "No token found, authorization required.",
        });
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
      data: error.response?.data || null,
    };

    return Promise.reject(customError);
  },
);

export default apiService;
