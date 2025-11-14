import React, { useState } from "react";
import { departmentsAPI } from "../../api";

export default function CreateDepartment() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await departmentsAPI.create({ name, description: desc });
      setMsg(`Created department: ${data.department.name}`);
      setName("");
      setDesc("");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Error");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-medium mb-3">Create Department</h3>
      <form onSubmit={submit} className="space-y-2">
        <input
          className="p-2 border w-full"
          placeholder="Computer Science"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="p-2 border w-full"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Create
        </button>
      </form>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}
