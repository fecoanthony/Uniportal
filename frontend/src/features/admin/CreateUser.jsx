import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // direct axios for department list
import { usersAPI } from "../../api";

export default function CreateUser() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department_id: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await usersAPI.create(form);
      setMsg(`Created: ${data.user.email}`);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        department_id: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Error");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-medium mb-3">Create User</h3>
      <form onSubmit={submit} className="space-y-2">
        <input
          required
          className="p-2 border w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          className="p-2 border w-full"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          className="p-2 border w-full"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="p-2 border w-full"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="p-2 border w-full"
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}
