import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { registrationsAPI, sessionsAPI, coursesAPI } from "../../api";
import useAuthStore from "../../store/authStore";

export default function RegisterCourse() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [session, setSession] = useState(null);
  const [course, setCourse] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const sRes = await sessionsAPI.active();
        setSession(sRes.data);
        // fetch course detail - if you have endpoint /courses/:id use it, else list and find
        const cList = await coursesAPI.list();
        const found = cList.data.find((x) => x._id === id);
        setCourse(found);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== "student") {
      setMsg("Only students can register");
      return;
    }
    if (!session) {
      setMsg("No active session");
      return;
    }

    try {
      await registrationsAPI.create({ course_id: id, session_id: session._id });
      setMsg("Registration submitted");
      setTimeout(() => nav("/"), 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.message || err.message || "Registration failed"
      );
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg">Register for Course</h3>
      <div className="mt-3">
        <div>
          Course:{" "}
          <strong>
            {course?.course_code} — {course?.title}
          </strong>
        </div>
        <div>
          Session: <strong>{session?.name}</strong>
        </div>
        <div className="mt-4">
          <button
            onClick={submit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Register
          </button>
        </div>
        {msg && <div className="mt-3 text-sm">{msg}</div>}
      </div>
    </div>
  );
}
