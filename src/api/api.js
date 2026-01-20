import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "https://api.techsoibd.com/api";

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ১. Request Interceptor (আগের মতোই থাকবে)
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

// ২. Response Interceptor (রিডাইরেক্ট লজিক এখানে)
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || error.status; // ইন্টারসেপ্টর বা সার্ভার থেকে আসা স্ট্যাটাস

    // যদি স্ট্যাটাস 401 (Unauthorized) হয়
    if (status === 401) {
      // টোকেন রিমুভ করে দেওয়া ভালো যাতে লুপ না হয়
      Cookies.remove("admin_token");

      // লগইন পেজে রিডাইরেক্ট (আপনার লগইন রাউট অনুযায়ী পাথ দিন)
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

    return Promise.reject(customError);
  },
);

export default apiService;
