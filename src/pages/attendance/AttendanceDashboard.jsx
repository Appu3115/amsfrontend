import { useEffect, useState } from "react";
import { getDepartmentWiseAttendance } from "../../api/attendanceApi";

export default function AttendanceDashboard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getDepartmentWiseAttendance()
      .then((response) => {
        setData(response.data);
      })
      .catch(() => {
        setError("Failed to load attendance dashboard");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Attendance Dashboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {data.map((dept, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "16px",
              borderRadius: "8px",
              width: "220px",
            }}
          >
            <h3>{dept.departmentName}</h3>
            <p>Present: {dept.presentCount}</p>
            <p>Absent: {dept.absentCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
