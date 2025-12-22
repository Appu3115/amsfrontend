import { useState } from "react";
import { punchIn } from "../api/attendanceApi";
import "../styles/Login.css";

const PunchIn = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePunchIn = async () => {
    if (!employeeId) {
      alert("Please enter Employee ID");
      return;
    }

    try {
      setLoading(true);
      const res = await punchIn(employeeId);
      alert("Punch In successful");
      console.log("Punch In response:", res.data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Punch In failed";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Punch In</h2>

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <button
          type="button"
          className="login-btn"
          onClick={handlePunchIn}
          disabled={loading}
        >
          {loading ? "Punching In..." : "Punch In"}
        </button>
      </div>
    </div>
  );
};

export default PunchIn;
