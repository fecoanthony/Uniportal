import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [] }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <div className="p-6">Access denied — insufficient permissions</div>;
  }
  return children;
}
