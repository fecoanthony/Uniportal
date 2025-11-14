import React, { useEffect, useState } from "react";
import { coursesAPI } from "../../api";
import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

export default function CoursesList() {
  const user = useAuthStore((s) => s.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await coursesAPI.list();
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Courses</h3>
        <div className="text-sm text-gray-600">
          {user ? `${user.name} (${user.role})` : "Guest"}
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c._id} className="p-4 border rounded">
              <div className="font-semibold">
                {c.course_code} — {c.title}
              </div>
              <div className="text-sm">Credits: {c.credit_units}</div>
              <div className="mt-2">
                {user?.role === "student" ? (
                  <Link to={`/register/${c._id}`} className="text-blue-600">
                    Register
                  </Link>
                ) : (
                  <span className="text-gray-500">
                    Login as student to register
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
