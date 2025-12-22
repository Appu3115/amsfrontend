import { useEffect, useState } from "react";
import { fetchAttendance } from "../api/attendanceApi";
import { FaSyncAlt } from "react-icons/fa";
import "../styles/AttendanceList.css";

export default function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async (empId = employeeId, attDate = date) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchAttendance(empId, attDate);

     
      if (typeof res.data === "string") {
        setAttendance([]);
        setError(res.data);
        return;
      }

      
      if (!Array.isArray(res.data)) {
        setAttendance([res.data]);
        return;
      }

     
      setAttendance(res.data);
    } catch (err) {
      setAttendance([]);
      setError(err.response?.data || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  
  const handleRefresh = async () => {
    setEmployeeId("");
    setDate("");
    await loadData("", "");
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <h2>Attendance List</h2>

        {/* FILTER BAR */}
        <div className="attendance-filters">
          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button onClick={() => loadData()}>Search</button>

          {/* REFRESH ICON */}
          <button
            className="refresh-btn"
            title="Refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "spin" : ""} />
          </button>
        </div>

        {error && <p className="attendance-error">{error}</p>}

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Status</th>
              <th>Overtime</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="no-records">
                  Loading...
                </td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-records">
                  No records found
                </td>
              </tr>
            ) : (
              attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.employee?.employeeId || a.employeeId}</td>
                  <td>{a.attendanceDate}</td>
                  <td>{a.login || "-"}</td>
                  <td>{a.logout || "-"}</td>
                  <td>{a.status}</td>
                  <td>{a.overtime ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
