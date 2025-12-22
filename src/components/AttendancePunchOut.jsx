import { useState } from "react";
import { punchOut } from "../api/attendanceApi";
import "../styles/Login.css";

function PunchOut() {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePunchOut = async () => {
    if (!employeeId) {
      alert("Please enter Employee ID");
      return;
    }

    try {
      setLoading(true);
      const res = await punchOut(employeeId);
      alert("Logout successful");
      console.log("Logout response:", res.data);
    } catch (err) {
      const msg =
        err.response?.data ||
        err.message ||
        "Logout failed";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Punch Out</h2>

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <button
          type="button"
          className="login-btn"
          onClick={handlePunchOut}
          disabled={loading}
        >
          {loading ? "Logging out..." : "Punch Out"}
        </button>
      </div>
    </div>
  );
}

export default PunchOut;
