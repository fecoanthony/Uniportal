// src/components/Profile/Profile.jsx
import React from "react";
import useAuthStore from "../../store/authStore";

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{user.name}</h1>

      <div className="bg-white p-4 rounded shadow">
        <div className="mb-2">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="mb-2">
          <strong>Role:</strong> {user.role}
        </div>

        {user.role === "student" && (
          <>
            <div className="mb-2">
              <strong>Matric No:</strong> {user.matric_no || "Not assigned"}
            </div>
            <div className="mb-2">
              <strong>Department:</strong>{" "}
              {user.department?.name ?? user.department}
            </div>
          </>
        )}

        {user.role !== "student" && (
          <div className="mb-2">
            <strong>Staff ID:</strong> {user.staff_id || "Not assigned"}
          </div>
        )}
      </div>
    </div>
  );
}
