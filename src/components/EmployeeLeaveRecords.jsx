import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "../styles/EmployeeLeaveRecords.css";

const EmployeeLeaveRecords = () => {
  const user = getUser();
  const employeeId = user?.employeeId;

  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  // Proof modal
  const [showPreview, setShowPreview] = useState(false);
  const [proofs, setProofs] = useState([]); // array of URLs
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  const fetchLeaveRecords = async () => {
    try {
      const res = await api.get(`/leave/records/${employeeId}`, {
        headers: { employeeId },
      });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Data ---------- */

  const allData = [
    ...records.pending,
    ...records.approved,
    ...records.rejected,
  ];

  const tableData =
    activeTab === "PENDING"
      ? records.pending
      : activeTab === "APPROVED"
      ? records.approved
      : activeTab === "REJECTED"
      ? records.rejected
      : allData;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "numeric",
          year: "numeric",
        })
      : "-";

  if (loading) return <p>Loading leave records...</p>;

  const currentProof = proofs[activeIndex];

  return (
    <>
      <div className="emp-leave-container">
        <h2>My Leave Records</h2>
        <p className="subtitle">Track all your leave requests and status</p>

        {/* Tabs */}
        <div className="leave-tabs">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {tableData.length === 0 ? (
          <p className="empty">No leave records found</p>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Leave Dates</th>
                <th>Status</th>
                <th>Proof</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((leave) => (
                <tr key={leave.leaveId}>
                  <td>{leave.leaveType}</td>
                  <td>{leave.reason}</td>
                  <td>{formatDate(leave.requestDate)}</td>
                  <td>
                    {formatDate(leave.startDate)} →{" "}
                    {formatDate(leave.endDate)}
                  </td>
                  <td>
                    <span className={`status ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.proofs?.length > 0 ? (
                      <button
                        className="view-btn"
                        onClick={() => {
                          const urls = leave.proofs.map(
                            (p) => p.fileUrl
                          );
                          setProofs(urls);
                          setActiveIndex(0);
                          setShowPreview(true);
                        }}
                      >
                        View ({leave.proofs.length})
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
      </div>

      {/* ===== Proof Modal ===== */}
      {showPreview && (
        <div className="proof-overlay">
          <div className="proof-modal">
            <button
              className="close-btn"
              onClick={() => {
                setShowPreview(false);
                setProofs([]);
              }}
            >
              ✕
            </button>

            <h3>Leave Proof</h3>

            <div className="proof-content">
              {currentProof?.endsWith(".pdf") ? (
                <iframe
                  src={currentProof}
                  title="Proof"
                  className="proof-frame"
                />
              ) : (
                <img
                  src={currentProof}
                  alt="Leave Proof"
                  className="proof-image"
                />
              )}
            </div>

            <div className="proof-footer">
              <button
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => i - 1)}
              >
                ◀ Prev
              </button>

              <span>
                {activeIndex + 1} / {proofs.length}
              </span>

              <button
                disabled={activeIndex === proofs.length - 1}
                onClick={() => setActiveIndex((i) => i + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeLeaveRecords;
