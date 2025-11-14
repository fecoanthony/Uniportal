import React, { useState } from "react";
import api from "../../api/axios";

export default function CreateDepartment() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin/departments", {
        name,
        description: desc,
      });
      setMsg("Created: " + data.department.name);
      setName("");
      setDesc("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Error creating dept");
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-2">Create Department</h3>
      {msg && <div className="mb-2 text-sm">{msg}</div>}
      <form onSubmit={submit} className="space-y-2">
        <input
          className="p-2 border w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Computer Science"
        />
        <textarea
          className="p-2 border w-full"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Create
        </button>
      </form>
    </div>
  );
}
