import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ children, roles = [] }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="p-6">
        <h3 className="text-xl font-semibold">Access denied</h3>
        <p className="text-sm mt-2">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return children;
}
