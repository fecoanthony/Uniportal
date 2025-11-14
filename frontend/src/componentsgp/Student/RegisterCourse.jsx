import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function RegisterCourse() {
  const { id } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .get("/sessions/active")
      .then((r) => setSession(r.data))
      .catch(() => setSession(null));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { course_id: id, session_id: session._id };
      await api.post("/registrations", body);
      setMsg("Registered successfully");
      setTimeout(() => nav("/"), 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error registering");
    }
  };

  if (!session) return <div className="p-6">Loading session…</div>;

  return (
    <div className="p-6">
      <h3 className="text-lg">Register for Course</h3>
      <div className="mt-4">
        <div>Session: {session.name}</div>
        <button
          onClick={submit}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Register
        </button>
        {msg && <div className="mt-2">{msg}</div>}
      </div>
    </div>
  );
}
