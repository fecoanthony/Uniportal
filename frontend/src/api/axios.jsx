import axios from "axios";
import useAuthStore from "../store/authStore";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://uniportal-llhg.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // <- important: include cookies in requests/responses
});

// request interceptor attaches token from zustand store
api.interceptors.request.use(
  (cfg) => {
    try {
      const tokenState = useAuthStore.getState().token;

      let tokenString = null;
      if (typeof tokenState === "string" && tokenState.trim() !== "") {
        tokenString = tokenState;
      } else if (tokenState && typeof tokenState === "object") {
        // attempt common fields but ensure we end with a string
        const candidate =
          tokenState.token || tokenState.accessToken || tokenState?.data?.token;
        if (typeof candidate === "string" && candidate.trim() !== "")
          tokenString = candidate;
      }

      if (tokenString) {
        cfg.headers.Authorization = `Bearer ${tokenString}`;
      } else {
        // ensure no stale header
        delete cfg.headers.Authorization;
      }
    } catch (e) {
      console.warn("axios interceptor token read error:", e);
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// response interceptor: auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        useAuthStore.getState().logout();
      } catch (_) {}
      // Optionally redirect: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
