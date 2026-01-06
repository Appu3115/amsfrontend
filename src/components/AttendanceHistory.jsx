import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "./StatusBadge";
import "../styles/AttendanceHistory.css";
import { getUser } from "../utils/auth";
const AttendanceHistory = () => {
  const user = getUser();
  const employeeId = user.employeeId?.toUpperCase();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employeeId) fetchAttendance();
  }, [employeeId]);

  // 📅 Date → 31/12/2025
  const formatDateOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  // ⏰ Time → 1:11 PM
  const formatTime12H = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get(
        `/attendance/employee/${employeeId}`
      );
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading attendance history...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>Attendance History</h2>
        <p>Track your daily attendance & work summary</p>
      </div>

      {attendance.length === 0 ? (
        <p className="empty">No attendance records found</p>
      ) : (
        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Attendance</th>
                <th>Daily Status</th>
                <th>Work (mins)</th>
                <th>Break (mins)</th>
                <th>Permission (mins)</th>
                <th>Late (mins)</th>
                <th>Overtime (mins)</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((a, index) => (
                <tr
                  key={index}
                  className={a.attendanceStatus?.toLowerCase()}
                >
                  <td>{formatDateOnly(a.attendanceDate)}</td>
                  <td>{formatTime12H(a.login)}</td>
                  <td>{formatTime12H(a.logout)}</td>

                  <td>
                    <StatusBadge status={a.attendanceStatus} />
                  </td>

                  <td>
                    <StatusBadge status={a.dailyStatus} />
                  </td>

                  <td>{formatDuration(a.totalWorkMinutes) ?? 0}</td>
                  <td>{formatDuration(a.totalBreakMinutes) ?? 0}</td>
                  <td>{formatDuration(a.permissionMinutes) ?? 0}</td>
                  <td>{formatDuration(a.lateMinutes) ?? 0}</td>
                  <td>{formatDuration(a.overtimeMinutes) ?? 0}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};
const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};
export default AttendanceHistory;
