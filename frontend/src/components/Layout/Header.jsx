import React from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
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
