import { useState } from "react";
import { punchIn } from "../api/attendanceApi";
import "../styles/AttendancePunchForm.css"; // ✅ IMPORTANT

export default function AttendancePunchIn({ onSuccess }) {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePunchIn = async () => {
    if (!employeeId) {
      alert("Please enter Employee ID");
      return;
    }

    try {
      setLoading(true);
      await punchIn(employeeId);
      alert("Punch In successful");
      props.onSuccess && props.onSuccess();

    } catch (e) {
      alert(e.response?.data || "Punch In failed");
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

      <button onClick={handlePunchIn} disabled={loading}>
        {loading ? "Punching In..." : "Punch In"}
      </button>
    </div>
  );
}
