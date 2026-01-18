import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllLeaveRequests.css";
import { getUser } from "../utils/auth";

const AllLeaveRequests = () => {
  const approver = getUser();
  const approverId = approver?.employeeId;

  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Data
  const [allLeaves, setAllLeaves] = useState([]);
  const [records, setRecords] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  // Proof modal
  const [showPreview, setShowPreview] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

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
      const res = await api.get("/leave/request/getall", {
        headers: { employeeId: approverId },
      });
      setAllLeaves(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/records/allLeaveRecords", {
        headers: { employeeId: approverId },
      });
      setRecords(res.data || { pending: [], approved: [], rejected: [] });
    } catch (err) {
      console.error(err);
      alert("Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const approveLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);

      await api.put(
        `/leave/approve/${leaveId}`,
        null,
        {
          headers: { employeeId: approverId },
        }
      );

      await refreshData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Leave approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);

      await api.put(
        `/leave/reject/${leaveId}`,
        null,
        {
          headers: { employeeId: approverId },
        }
      );

      await refreshData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Leave rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const refreshData = async () => {
    if (activeTab === "ALL") await fetchAllLeaves();
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

  const currentProof = proofs[activeIndex];

  return (
    <>
      <div className="leave-admin-container">
        <h2>Leave Management</h2>

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

                  {/* Proof */}
                  {activeTab === "ALL" && (
                    <td>
                      {leave.proofUrls?.length > 0 ? (
                        <button
                          className="view-btn"
                          onClick={() => {
                            setProofs(leave.proofUrls);
                            setActiveIndex(0);
                            setShowPreview(true);
                          }}
                        >
                          View ({leave.proofUrls.length})
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}

                  {/* Action */}
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

export default AllLeaveRequests;
