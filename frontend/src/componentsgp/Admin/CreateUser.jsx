import React, { useEffect, useState } from "react";
import api from "../../api/axios";

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
    api
      .get("/departments")
      .then((r) => setDepartments(r.data))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.post("/admin/users", form);
      setMsg("Created: " + data.user.email);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        department_id: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-2">Create User</h3>
      <form onSubmit={submit} className="space-y-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 border w-full"
          placeholder="Full name"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="p-2 border w-full"
          placeholder="email"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="p-2 border w-full"
          placeholder="password"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="p-2 border w-full"
        >
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          className="p-2 border w-full"
        >
          <option value="">Select department</option>
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
      {msg && <div className="mt-2">{msg}</div>}
    </div>
  );
}
