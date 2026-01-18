import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "../styles/DepartmentAttendance.css";

const DepartmentAttendance = () => {
  const user = getUser(); // manager
  const employeeId = user?.employeeId;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await api.get("/attendance/department", {
        headers: { employeeId }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="att-loader">Loading department attendance…</div>;
  }

  if (error) {
    return <div className="att-error">{error}</div>;
  }

  return (
    <div className="att-container">
      <div className="att-header">
        <h2>Department Attendance</h2>
        <p>View attendance of your department employees</p>
      </div>

      <div className="att-card">
        <table className="att-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Status</th>
              <th>Late (min)</th>
              <th>Overtime</th>
              <th>Shift</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No attendance records found
                </td>
              </tr>
            ) : (
              data.map((att) => (
                <tr key={att.attendanceId}>
                  <td>{att.employee.employeeId}</td>
                  <td>{att.employee.name}</td>
                  <td>{att.attendanceDate}</td>
                  <td>{formatTime(att.login)}</td>
                  <td>{formatTime(att.logout)}</td>
                  <td>
                    <span className={`status ${att.status.toLowerCase()}`}>
                      {att.status}
                    </span>
                  </td>
                  <td>{att.lateMinutes}</td>
                  <td>{att.overtimeMinutes}</td>
                  <td>{att.shift?.shiftName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatTime = (time) => {
  if (!time) return "--";
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default DepartmentAttendance;
