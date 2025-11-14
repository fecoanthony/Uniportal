import React, { useState } from "react";
import { resultsAPI } from "../../api";
import useAuthStore from "../../store/authStore";

export default function UploadResults() {
  const user = useAuthStore((s) => s.user);
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const canUpload = user && (user.role === "lecturer" || user.role === "admin");

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a CSV file");
    if (!canUpload) return alert("Unauthorized");

    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await resultsAPI.upload(fd);
      setReport(data);
    } catch (err) {
      setReport({ error: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h3 className="text-lg font-medium mb-3">Upload Results (CSV)</h3>
      <div className="text-sm text-gray-600 mb-4">
        Signed in as{" "}
        <strong>
          {user?.name} ({user?.role})
        </strong>
      </div>

      {!canUpload && (
        <div className="mb-3 text-red-600">
          You don't have permission to upload results.
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          disabled={!canUpload || loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {report && (
        <div className="mt-4">
          <h4 className="font-medium">Report</h4>
          <pre className="text-sm bg-gray-100 p-3 rounded max-h-80 overflow-auto">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
