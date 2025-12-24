import { useState } from "react";
import { punchOut } from "../api/attendanceApi";
import "../styles/AttendancePunchForm.css"; // ✅ SAME CSS

export default function AttendancePunchOut({ onSuccess }) {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePunchOut = async () => {
    if (!employeeId) {
      alert("Please enter Employee ID");
      return;
    }

    try {
      setLoading(true);
      await punchOut(employeeId);
      alert("Punch Out successful");
      props.onSuccess && props.onSuccess();

    } catch (e) {
      alert(e.response?.data || "Punch Out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="punch-form">
      <label>Employee ID</label>
      <input
        type="text"
        placeholder="Enter Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />

      <button onClick={handlePunchOut} disabled={loading}>
        {loading ? "Punching Out..." : "Punch Out"}
      </button>
    </div>
  );
}
