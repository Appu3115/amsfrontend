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
      const res = await api.get("/attendance/all");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching admin attendance", err);
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
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Late (min)</th>
              <th>OT (min)</th>
              <th>Status</th>
              <th>Work (min)</th>
              <th>Break (min)</th>
              <th>Permission</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>
                  <div className="emp-info">
                    <span className="emp-name">{row.employeeName}</span>
                    <span className="emp-id">{row.employeeId}</span>
                  </div>
                </td>

                <td>{formatDateOnly( row.attendanceDate)}</td>

                <td>{row.login ? formatTime(row.login) : "-"}</td>
                <td>{row.logout ? formatTime(row.logout) : "-"}</td>

                <td>{formatDuration(row.lateMinutes)}</td>
                <td>{formatDuration(row.overtimeMinutes)}</td>

                <td>
                  <span
                    className={`status ${row.attendanceStatus.toLowerCase()}`}
                  >
                    {row.attendanceStatus}
                  </span>
                </td>

                <td>{formatDuration(row.totalWorkMinutes) ?? "-"}</td>
                <td>{formatDuration(row.totalBreakMinutes) ?? "-"}</td>
                <td>{formatDuration(row.permissionMinutes) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 🔹 Time formatter
const formatTime = (dateTime) => {
  const d = new Date(dateTime);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
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
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export default AdminAttendance;
