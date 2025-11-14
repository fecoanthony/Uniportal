// src/store/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  // login: (user, token) => {
  //   set({ user, token });
  //   localStorage.setItem("token", token);
  //   localStorage.setItem("user", JSON.stringify(user));
  // },

  login: (token, user) => {
    // ensure token is a string or null
    const tokenString = typeof token === "string" ? token : null;
    set({ token: tokenString, user });
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  restore: () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      set({ user, token });
    }
  },
}));

export default useAuthStore;
