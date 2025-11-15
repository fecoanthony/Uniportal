import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    async function fetchResults() {
      try {
        const resp = await api.get("/student/results", {
          withCredentials: true,
        });
        if (resp.data.success) setResults(resp.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  if (loading) return <div>Loading results...</div>;

  if (!results.length) return <div>No results available yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Results</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Course</th>
            <th className="py-2 px-4 border">Code</th>
            <th className="py-2 px-4 border">Credits</th>
            <th className="py-2 px-4 border">Score</th>
            <th className="py-2 px-4 border">Grade</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r._id} className="text-center">
              <td className="py-2 px-4 border">{r.course.name}</td>
              <td className="py-2 px-4 border">{r.course.code}</td>
              <td className="py-2 px-4 border">{r.course.credits}</td>
              <td className="py-2 px-4 border">{r.score}</td>
              <td className="py-2 px-4 border">{r.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
