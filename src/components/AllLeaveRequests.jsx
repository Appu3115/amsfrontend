import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllLeaveRequests.css";

const AllLeaveRequests = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // API 1 – All leave requests (with proofs)
  const [allLeaves, setAllLeaves] = useState([]);

  // API 2 – Status-wise admin records
  const [records, setRecords] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  // Proof preview
  const [proofs, setProofs] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    if (activeTab === "ALL") {
      fetchAllLeaves();
    } else {
      fetchLeaveRecords();
    }
  }, [activeTab]);

  /* ---------------- API CALLS ---------------- */

  const fetchAllLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/request/getall");
      setAllLeaves(res.data || []);
    } catch (err) {
      console.error("Failed to load all leave requests", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/records/allLeaveRecords");
      setRecords(res.data || { pending: [], approved: [], rejected: [] });
    } catch (err) {
      console.error("Failed to load leave records", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const approveLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      await api.put(`/leave/approve/${leaveId}`);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Leave approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      await api.put(`/leave/reject/${leaveId}`);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Leave rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const refreshData = async () => {
    if (activeTab === "ALL") {
      await fetchAllLeaves();
    }
    await fetchLeaveRecords();
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "numeric",
          year: "numeric",
        })
      : "-";

  /* ---------------- DATA SOURCE ---------------- */

  const tableData =
    activeTab === "PENDING"
      ? records.pending
      : activeTab === "APPROVED"
      ? records.approved
      : activeTab === "REJECTED"
      ? records.rejected
      : allLeaves;

  if (loading) return <p>Loading leave requests...</p>;

  return (
    <div className="leave-admin-container">
      <h2>Leave Management</h2>

      {/* 🔹 Tabs */}
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
        <p>No leave records found</p>
      ) : (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Reason</th>
              <th>Requested Date</th>
              <th>Leave Dates</th>
              <th>Status</th>
              {activeTab === "ALL" && <th>Proof</th>}
              {activeTab === "ALL" && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {tableData.map((leave) => (
              <tr key={leave.leaveId}>
                <td>
                  {leave.employeeName}
                  <br />
                  <small>{leave.employeeId}</small>
                </td>

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

                {/* Proof – ONLY ALL TAB */}
                {activeTab === "ALL" && (
                  <td>
                    {leave.proofUrls?.length > 0 ? (
                      <button
                        className="view-btn"
                        onClick={() => {
                          setProofs(leave.proofUrls);
                          setPreviewUrl(leave.proofUrls[0]);
                          setPreviewType(
                            leave.proofUrls[0].endsWith(".pdf")
                              ? "pdf"
                              : "image"
                          );
                        }}
                      >
                        View ({leave.proofUrls.length})
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                )}

                {/* Action – ONLY ALL TAB */}
                {activeTab === "ALL" && (
                  <td>
                    {leave.status === "PENDING" ? (
                      <div className="action-buttons">
                        <button
                          className="approve-btn"
                          disabled={actionLoading === leave.leaveId}
                          onClick={() => approveLeave(leave.leaveId)}
                        >
                          {actionLoading === leave.leaveId
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          className="reject-btn"
                          disabled={actionLoading === leave.leaveId}
                          onClick={() => rejectLeave(leave.leaveId)}
                        >
                          {actionLoading === leave.leaveId
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔍 Proof Preview */}
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
              <div className="proof-list">
                {proofs.map((url, index) => (
                  <button
                    key={index}
                    className={`proof-item ${
                      previewUrl === url ? "active" : ""
                    }`}
                    onClick={() => {
                      setPreviewUrl(url);
                      setPreviewType(
                        url.endsWith(".pdf") ? "pdf" : "image"
                      );
                    }}
                  >
                    Proof {index + 1}
                  </button>
                ))}
              </div>

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
