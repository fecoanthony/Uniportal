// src/components/Layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Safely extract department name - user.department may be populated object or id
  const deptName = (() => {
    if (!user) return null;
    if (user.department && typeof user.department === "object")
      return user.department.name || null;
    if (user.department?.name) return user.department.name;
    if (
      user.department_id &&
      typeof user.department_id === "object" &&
      user.department_id.name
    )
      return user.department_id.name;
    if (typeof user.department === "string") return user.department;
    return null;
  })();

  const handleLogout = async () => {
    try {
      // optional: call backend logout to clear cookie
      await api.post("/auth/logout").catch(() => {}); // ignore errors
    } catch (e) {
      // ignore
    } finally {
      logout(); // clear client auth state
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-lg font-bold">
            UniPortal
          </Link>
          <nav className="space-x-3 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Courses
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin/create-department"
                className="text-gray-600 hover:text-gray-900"
              >
                Admin
              </Link>
            )}
            {(user?.role === "lecturer" || user?.role === "admin") && (
              <Link
                to="/lecturer/upload-results"
                className="text-gray-600 hover:text-gray-900"
              >
                Upload Results
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-sm text-right">
                <div className="font-medium">{user.name}</div>
                <div className="font-medium">{user.email}</div>
                <div className="text-xs text-gray-500">{user.role}</div>

                {user.role === "student" && (
                  <>
                    <div className="text-xs text-gray-500">
                      Matric: {user.matric_no ?? "Not assigned"}
                    </div>
                    {deptName && (
                      <div className="text-xs text-gray-500">
                        Dept: {deptName}
                      </div>
                    )}
                  </>
                )}

                {user.role !== "student" && user.staff_id && (
                  <div className="text-xs text-gray-500">{user.staff_id}</div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1 border rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 border rounded text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
