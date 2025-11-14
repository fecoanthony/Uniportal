import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  // inside Login.jsx

  const loginAction = useAuthStore((s) => s.login);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const resp = await authAPI.login({ email, password });
      console.log("login resp:", resp);

      // normalize response shapes
      const data = resp?.data ?? {};
      console.log(data.user);

      // token might be in several places; pick the string if present
      const tokenCandidate =
        (typeof data.token === "string" && data.token) ||
        (typeof data.accessToken === "string" && data.accessToken) ||
        (data?.data?.token &&
          typeof data.data.token === "string" &&
          data.data.token) ||
        null;

      // user might also be in data.user or data.data.user or returned by refresh later
      const userCandidate = data.user || data?.data?.user || null;

      if (tokenCandidate && userCandidate) {
        // store token (string) and user
        loginAction(tokenCandidate, userCandidate);
        // small delay to ensure store subscribers see update
        setTimeout(() => navigate("/", { replace: true }), 0);
        return;
      }

      // If server set HttpOnly cookie and returned user only:
      if (!tokenCandidate && userCandidate) {
        // we don't have an access token string; cookie holds it
        loginAction(null, userCandidate);
        setTimeout(() => navigate("/", { replace: true }), 0);
        return;
      }

      // If server returned nothing, try refresh (cookie will be sent)
      const refresh = await api.post("/auth/refresh");
      const rdata = refresh?.data ?? {};
      const rToken = rdata.token || rdata.accessToken || null;
      const rUser = rdata.user || null;
      if (rToken && rUser) {
        loginAction(rToken, rUser);
        setTimeout(() => navigate("/", { replace: true }), 0);
        return;
      }

      throw new Error("Invalid login response shape");
    } catch (err) {
      console.error("login error:", err);
      setErr(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 bg-white rounded shadow"
      >
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        {err && <div className="mb-3 text-red-600">{err}</div>}
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
