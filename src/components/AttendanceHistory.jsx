import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "./StatusBadge";
import "../styles/AttendanceHistory.css";
import { getUser } from "../utils/auth";
import LeaveRequest from "./LeaveRequest";

const AttendanceHistory = () => {
  const user = getUser();
  const employeeId = user?.employeeId?.toUpperCase();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLeave, setShowLeave] = useState(false);

  useEffect(() => {
    if (employeeId) fetchAttendance();
  }, [employeeId]);

  /* ---------- Helpers ---------- */

  const formatDateOnly = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const formatTime12H = (dateTime) =>
    dateTime
      ? new Date(dateTime).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  /* ---------- FETCH ---------- */
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/attendance/employee/${employeeId}`
      );

      // ✅ IMPORTANT FIX: extract list from ResponseEntity
      setAttendance(res.data || []);

    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <p className="loading">
        Loading attendance history...
      </p>
    );

  if (error)
    return <p className="error">{error}</p>;

  return (
    <>
      <div className="attendance-container">
        {/* ===== Header ===== */}
        <div className="attendance-header">
          <div>
            <h2>Attendance History</h2>
            <p>
              Track your daily attendance & work summary
            </p>
          </div>

          <button
            className="apply-leave-btn"
            onClick={() => setShowLeave(true)}
          >
            + Apply Leave
          </button>
        </div>

        {attendance.length === 0 ? (
          <p className="empty">
            No attendance records found
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Status</th>
                  <th>Work</th>
                  <th>Break</th>
                  <th>Permission</th>
                  <th>Late</th>
                  <th>Overtime</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((a, index) => (
                  <tr
                    key={index}
                    className={a.dailyStatus?.toLowerCase()}
                  >
                    <td>
                      {formatDateOnly(
                        a.attendanceDate
                      )}
                    </td>
                    <td>
                      {formatTime12H(a.login)}
                    </td>
                    <td>
                      {formatTime12H(a.logout)}
                    </td>

                    <td>
                      <StatusBadge
                        status={a.dailyStatus}
                      />
                    </td>

                    <td>
                      {formatDuration(
                        a.totalWorkMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.totalBreakMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.permissionMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.lateMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.overtimeMinutes
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Leave Request Popup ===== */}
      {showLeave && (
        <LeaveRequest
          onClose={() => {
            setShowLeave(false);
            fetchAttendance(); // refresh after leave
          }}
        />
      )}
    </>
  );
};

/* ---------- Duration formatter ---------- */
const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined)
    return "-";
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0
    ? `${hrs}h ${mins}m`
    : `${hrs}h`;
};

export default AttendanceHistory;
