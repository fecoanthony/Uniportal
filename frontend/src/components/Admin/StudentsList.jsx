// src/components/Admin/StudentsList.jsx
import React, { useEffect, useState } from "react";
import { usersAPI } from "../../api";
import api from "../../api/axios";

export default function StudentsList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/users?role=student"); // adjust endpoint
        setStudents(res.data.users || res.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Students</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Matric No</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.matric_no || "—"}</td>
              <td>{s.department?.name || s.department || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
