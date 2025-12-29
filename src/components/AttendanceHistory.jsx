import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "./StatusBadge";
import "../styles/AttendanceHistory.css";

const AttendanceHistory = () => {
  const employeeId = JSON.parse(sessionStorage.getItem("user"))?.employeeId;

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/employeeid", {
        params: { EmployeeId: employeeId },
      });
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
        <p>Track your daily login, logout, and status</p>
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
                <th>Status</th>
                <th>Overtime (mins)</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.attendanceDate}</td>
                  <td>{a.login ? a.login.substring(11, 16) : "-"}</td>
                  <td>{a.logout ? a.logout.substring(11, 16) : "-"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>{a.overtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
