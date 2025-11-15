// src/components/Layout/Navbar.jsx
import React from "react";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);

  const deptName = (() => {
    if (!user) return null;
    if (user.department && typeof user.department === "object")
      return user.department.name || null;
    if (
      user.department_id &&
      typeof user.department_id === "object" &&
      user.department_id.name
    )
      return user.department_id.name;
    return typeof user.department === "string" ? user.department : null;
  })();

  return (
    <nav className="w-full p-4 bg-white shadow flex justify-between items-center">
      <div>
        <Link to="/">University Portal</Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* <div className="text-sm">
              <div className="font-medium">{user.name}</div>

              {user.role === "student" && (
                <div className="text-xs text-gray-500">
                  Matric: {user.matric_no ?? "—"}
                </div>
              )}

              {user.role !== "student" && user.staff_id && (
                <div className="text-xs text-gray-500">{user.staff_id}</div>
              )}

              {deptName && (
                <div className="text-xs text-gray-500">{deptName}</div>
              )}
            </div> */}
            <Link to="/profile" className="px-3 py-1 border rounded">
              Profile
            </Link>
          </>
        ) : (
          <Link to="/login" className="px-3 py-1 border rounded">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
