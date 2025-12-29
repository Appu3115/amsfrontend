import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllLeaveRequests.css";

const AllLeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  {leave.startDate} → {leave.endDate}
                </td>

                <td>
                  <span className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>

                <td>
                  {leave.proofUrls && leave.proofUrls.length > 0 ? (
                    <a
                      href={leave.proofUrls[0]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
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
  );
};

export default AllLeaveRequests;
