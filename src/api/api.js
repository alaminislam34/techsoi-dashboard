import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://api.techsoibd.com/api";

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

apiService.interceptors.request.use(
  (config) => {
    // If sending FormData, let the browser/axios set the Content-Type
    if (
      config.data &&
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else {
      // default to JSON for non-FormData requests
      config.headers["Content-Type"] =
        config.headers["Content-Type"] || "application/json";
    }
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
    const status = error.response?.status || error.status;

    if (status === 401) {
      Cookies.remove("admin_token");

      window.location.href = "/login";
    }

    const customError = {
      status: status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      data: error.response?.data || null,
    };

    if (error.response?.status === 401) {
      Cookies.remove("admin_token");
      localStorage.removeItem("user");
    }

    return Promise.reject(customError);
  },
);

export default apiService;
