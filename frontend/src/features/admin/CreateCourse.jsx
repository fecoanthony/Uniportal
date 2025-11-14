import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { coursesAPI } from "../../api";

export default function CreateCourse() {
  const [depts, setDepts] = useState([]);
  const [form, setForm] = useState({
    course_code: "",
    title: "",
    credit_units: 3,
    department_id: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/departments");
        setDepts(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        ...form,
        course_code: form.course_code.toUpperCase().trim(),
      };
      const { data } = await coursesAPI.create(payload);
      setMsg(`Created course: ${data.course.course_code}`);
      setForm({
        course_code: "",
        title: "",
        credit_units: 3,
        department_id: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Error");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-medium mb-3">Create Course</h3>
      <form onSubmit={submit} className="space-y-2">
        <input
          required
          className="p-2 border w-full"
          placeholder="CSC101"
          value={form.course_code}
          onChange={(e) => setForm({ ...form, course_code: e.target.value })}
        />
        <input
          required
          className="p-2 border w-full"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          required
          type="number"
          className="p-2 border w-full"
          value={form.credit_units}
          onChange={(e) =>
            setForm({ ...form, credit_units: Number(e.target.value) })
          }
        />
        <select
          className="p-2 border w-full"
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        >
          <option value="">Select dept</option>
          {depts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">
          Create Course
        </button>
      </form>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}
