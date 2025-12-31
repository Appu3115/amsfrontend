import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllLeaveRequests.css";

const AllLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofs, setProofs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
const [previewType, setPreviewType] = useState(null); // "image" | "pdf"


  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      // ✅ FIXED ENDPOINT
      const res = await api.get("/leave/request/getall");
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to load leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading leave requests...</p>;
const formatDateOnly = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });
};
  return (
    <div className="leave-admin-container">
      <h2>All Leave Requests</h2>

      {leaves.length === 0 ? (
        <p>No leave requests found</p>
      ) : (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Reason</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Proof</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.leaveId}>
                <td>
                  {leave.employeeName}
                  <br />
                  <small>{leave.employeeId}</small>
                </td>

                <td>{leave.leaveType}</td>
                <td>{leave.reason}</td>

                <td>
                  {formatDateOnly(leave.startDate)} → {formatDateOnly(leave.endDate)}
                </td>

                <td>
                  <span className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>

                <td>
  {leave.proofUrls && leave.proofUrls.length > 0 ? (
    <button
      className="view-btn"
      onClick={() => {
        setProofs(leave.proofUrls);
        setPreviewUrl(leave.proofUrls[0]);

        const first = leave.proofUrls[0];
        setPreviewType(first.endsWith(".pdf") ? "pdf" : "image");
      }}
    >
      View ({leave.proofUrls.length})
    </button>
  ) : (
    "—"
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
        
      )}
      {previewUrl && (
  <div className="preview-overlay">
    <div className="preview-modal large">
      <button
        className="close-btn"
        onClick={() => {
          setPreviewUrl(null);
          setProofs([]);
        }}
      >
        ✖
      </button>

      <div className="preview-content">
        {/* 📂 Proof list */}
        <div className="proof-list">
          {proofs.map((url, index) => (
            <button
              key={index}
              className={`proof-item ${
                previewUrl === url ? "active" : ""
              }`}
              onClick={() => {
                setPreviewUrl(url);
                setPreviewType(url.endsWith(".pdf") ? "pdf" : "image");
              }}
            >
              Proof {index + 1}
            </button>
          ))}
        </div>

        {/* 👀 Preview area */}
        <div className="proof-preview">
          {previewType === "image" && (
            <img src={previewUrl} alt="Proof" />
          )}

          {previewType === "pdf" && (
            <iframe
              src={previewUrl}
              title="Proof PDF"
              width="100%"
              height="100%"
            />
          )}
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AllLeaveRequests;
