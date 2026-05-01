import axios from "axios";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const baseURL =
  import.meta.env.VITE_RENDER_API_BASE_URL;

if (!baseURL) {
  console.warn("⚠️ VITE_RENDER_API_BASE_URL is not defined in .env! API requests may fail or hit the wrong server.");
}

export const api = axios.create({
  baseURL: baseURL || "/", // Fallback to root if undefined to avoid breaking axios.create
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // 🔥 CRITICAL: Check if response is HTML (happens on incorrect base URL hitting frontend)
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      const errorMsg = `❌ API returned HTML instead of JSON. Check baseURL configuration. 
        Attempted URL: ${response.config.url}
        BaseURL: ${response.config.baseURL}`;
      console.error(errorMsg);
      return Promise.reject({
        message: "Server returned HTML instead of JSON. Possible incorrect API URL.",
        url: response.config.url,
        baseURL: response.config.baseURL,
        response: response
      });
    }
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");

      // Dispatch logout action if store is available
      if (store) {
        store.dispatch({ type: "auth/clearAuth" });
      }

      // Redirect to login page if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;