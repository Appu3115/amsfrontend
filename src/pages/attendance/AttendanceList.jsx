import { useEffect, useState } from "react";
import { fetchAttendance } from "../../api/attendanceApi";

export default function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");

  const loadData = () => {
    fetchAttendance(employeeId, date)
      .then((res) => setAttendance(res.data))
      .catch(() => alert("Failed to fetch attendance"));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Attendance List</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={loadData}>Search</button>
      </div>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Date</th>
            <th>Login</th>
            <th>Logout</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((a) => (
            <tr key={a.id}>
              <td>{a.employeeId}</td>
              <td>{a.attendanceDate}</td>
              <td>{a.login || "-"}</td>
              <td>{a.logout || "-"}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
