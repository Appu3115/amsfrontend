import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AdminAttendance.css";

const AdminAttendance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/all");

      // ✅ IMPORTANT FIX: extract array from ResponseEntity
      setData(res.data?.body || []);
    } catch (err) {
      console.error("Error fetching admin attendance", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading attendance...</div>;
  }

  return (
    <div className="admin-attendance-container">
      <div className="header">
        <h2>Attendance Overview</h2>
        <p>All employees daily attendance & work summary</p>
      </div>

      <div className="table-card">
        {data.length === 0 ? (
          <p className="empty">No attendance records found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
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
              {data.map((row, index) => (
                <tr
                  key={index}
                  className={row.dailyStatus?.toLowerCase()}
                >
                  <td>
                    <div className="emp-info">
                      <span className="emp-name">
                        {row.employeeName}
                      </span>
                      <span className="emp-id">
                        {row.employeeId}
                      </span>
                    </div>
                  </td>

                  <td>{formatDateOnly(row.attendanceDate)}</td>

                  <td>{formatTime(row.login)}</td>
                  <td>{formatTime(row.logout)}</td>

                  <td>
                    <span
                      className={`status ${row.dailyStatus?.toLowerCase()}`}
                    >
                      {row.dailyStatus}
                    </span>
                  </td>

                  <td>{formatDuration(row.totalWorkMinutes)}</td>
                  <td>{formatDuration(row.totalBreakMinutes)}</td>
                  <td>{formatDuration(row.permissionMinutes)}</td>
                  <td>{formatDuration(row.lateMinutes)}</td>
                  <td>{formatDuration(row.overtimeMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const formatTime = (dateTime) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnly = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export default AdminAttendance;
