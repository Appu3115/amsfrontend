import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "../styles/DepartmentLeaveRequests.css";

const DepartmentLeaveRequests = () => {
  const user = getUser();
  const employeeId = user?.employeeId;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===== PROOF MODAL STATE ===== */
  const [showModal, setShowModal] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ===== ACTION LOADING ===== */
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await api.get("/leave/requests/department", {
        headers: { employeeId },
      });
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const approveLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      await api.put(`/leave/approve/${leaveId}`);
      await loadLeaves();
    } catch {
      alert("Leave approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectLeave = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      await api.put(`/leave/reject/${leaveId}`);
      await loadLeaves();
    } catch {
      alert("Leave rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= PROOF ================= */

  const openProofModal = (proofList) => {
    setProofs(proofList);
    setActiveIndex(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setProofs([]);
    setActiveIndex(0);
  };

  const renderProof = (url) => {
    if (!url) return null;

    const ext = url.split(".").pop().toLowerCase();

    // PDF
    if (ext === "pdf") {
      return (
        <iframe
          src={url}
          title="Leave Proof PDF"
          className="proof-pdf"
        />
      );
    }

    // Image
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
      return (
        <img
          src={url}
          alt="Leave Proof"
          className="proof-image"
        />
      );
    }

    // Other documents
    return (
      <div className="proof-download">
        <p>Preview not available for this file type</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="download-btn"
        >
          Download / Open File
        </a>
      </div>
    );
  };

  if (loading)
    return <div className="leave-loader">Loading leave requests…</div>;
  if (error)
    return <div className="leave-error">{error}</div>;

  const currentProof = proofs[activeIndex];

  return (
    <>
      <div className="leave-container">
        <div className="leave-card">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Proof</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                data.map((leave) => (
                  <tr key={leave.leaveId}>
                    <td>{leave.employee.employeeId}</td>
                    <td>{leave.employee.name}</td>
                    <td>{leave.leaveType}</td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{getDays(leave.startDate, leave.endDate)}</td>

                    <td>
                      <span
                        className={`status ${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      {leave.proofs?.length > 0 ? (
                        <button
                          className="proof-btn"
                          onClick={() =>
                            openProofModal(leave.proofs)
                          }
                        >
                          View ({leave.proofs.length})
                        </button>
                      ) : (
                        "--"
                      )}
                    </td>

                    <td>
                      {leave.status === "PENDING" ? (
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            disabled={
                              actionLoading === leave.leaveId
                            }
                            onClick={() =>
                              approveLeave(leave.leaveId)
                            }
                          >
                            {actionLoading === leave.leaveId
                              ? "Approving..."
                              : "Approve"}
                          </button>

                          <button
                            className="reject-btn"
                            disabled={
                              actionLoading === leave.leaveId
                            }
                            onClick={() =>
                              rejectLeave(leave.leaveId)
                            }
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PROOF MODAL ================= */}
      {showModal && (
        <div className="proof-overlay">
          <div className="proof-modal">
            <button className="close-btn" onClick={closeModal}>
              ✕
            </button>

            <h3>Leave Proof</h3>

            <div className="proof-content">
              {renderProof(currentProof?.fileUrl)}
            </div>

            <div className="proof-footer">
              <button
                disabled={activeIndex === 0}
                onClick={() =>
                  setActiveIndex((i) => i - 1)
                }
              >
                ◀ Prev
              </button>

              <span>
                {activeIndex + 1} / {proofs.length}
              </span>

              <button
                disabled={
                  activeIndex === proofs.length - 1
                }
                onClick={() =>
                  setActiveIndex((i) => i + 1)
                }
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

const getDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor(
    (e - s) / (1000 * 60 * 60 * 24)
  ) + 1;
};

export default DepartmentLeaveRequests;
