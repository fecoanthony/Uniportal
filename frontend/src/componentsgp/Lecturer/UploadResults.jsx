import React, { useState } from "react";
import api from "../../api/axios";

export default function UploadResults() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose CSV file");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/results/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReport(data);
    } catch (err) {
      setReport({ error: err.response?.data?.message || err.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg">Upload Results (CSV)</h3>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded"
          disabled={loading}
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
