import React, { useEffect, useState } from "react";
import api from "../../api/axios";

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
    api
      .get("/departments")
      .then((r) => setDepts(r.data))
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.post("/admin/courses", form);
      setMsg("Course created: " + data.course.course_code);
      setForm({
        course_code: "",
        title: "",
        credit_units: 3,
        department_id: "",
      });
    } catch (err) {
      setMsg(err.response?.data?.message || "Error creating course");
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium">Create Course</h3>
      <form onSubmit={submit} className="space-y-2 mt-3">
        <input
          value={form.course_code}
          onChange={(e) => setForm({ ...form, course_code: e.target.value })}
          className="p-2 border w-full"
          placeholder="CSC101"
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="p-2 border w-full"
          placeholder="Intro to Computing"
        />
        <input
          type="number"
          value={form.credit_units}
          onChange={(e) =>
            setForm({ ...form, credit_units: Number(e.target.value) })
          }
          className="p-2 border w-full"
        />
        <select
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          className="p-2 border w-full"
        >
          <option value="">Select department</option>
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
      {msg && <div className="mt-2">{msg}</div>}
    </div>
  );
}
