import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api
      .get("/courses")
      .then((r) => setCourses(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h3 className="text-lg">Courses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {courses.map((c) => (
          <div key={c._id} className="p-4 border rounded">
            <div className="font-semibold">
              {c.course_code} — {c.title}
            </div>
            <div className="text-sm">Credits: {c.credit_units}</div>
            <div className="mt-2">
              <a href={`/register/${c._id}`} className="text-blue-600">
                Register
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
