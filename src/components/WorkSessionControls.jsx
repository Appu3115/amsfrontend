import React, { useState } from "react";
import api from "../api/axios";
import "../styles/WorkSessionControls.css";

const WorkSessionControls = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const employeeId = user?.employeeId;

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const startPause = async (type) => {
    setLoading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const res = await api.post("/attendance/pause", null, {
        params: { employeeId, type },
      });
      setStatusMsg(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const resumeWork = async () => {
    setLoading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const res = await api.post("/attendance/resume", null, {
        params: { employeeId },
      });
      setStatusMsg(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ws-card">
      <div className="ws-header">
        <h3>Work Session</h3>
        <p>Manage your work & break time</p>
      </div>

      <div className="ws-actions">
        <button
          className="ws-btn ws-break"
          disabled={loading}
          onClick={() => startPause("BREAK")}
        >
          ☕ Take Break
        </button>

        <button
          className="ws-btn ws-lunch"
          disabled={loading}
          onClick={() => startPause("LUNCH")}
        >
          🍽 Lunch
        </button>

        <button
          className="ws-btn ws-resume"
          disabled={loading}
          onClick={resumeWork}
        >
          ▶ Resume Work
        </button>
      </div>

      {statusMsg && <div className="ws-success">{statusMsg}</div>}
      {errorMsg && <div className="ws-error">{errorMsg}</div>}
    </div>
  );
};

export default WorkSessionControls;
