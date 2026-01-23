import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "../styles/EmployeeWorkTracker.css";

/* ================= TIME FORMAT ================= */
const formatDuration = (minutes = 0) => {
  const seconds = Math.max(minutes, 0) * 60;
  return new Date(seconds * 1000).toISOString().substring(11, 19);
};

const formatSeconds = (seconds = 0) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const EmployeeWorkTracker = ({ employeeId }) => {
  const [status, setStatus] = useState("IDLE"); // WORK / BREAK / LUNCH / IDLE
  const [runningSeconds, setRunningSeconds] = useState(0);

  const [summary, setSummary] = useState({
    work: 0,
    break: 0,
    idle: 0,
    productive: 0,
  });

  const timerRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  /* ================= TIMER ================= */
  const startTimer = () => {
    clearInterval(timerRef.current);
    const start = Date.now();

    timerRef.current = setInterval(() => {
      setRunningSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setRunningSeconds(0);
  };

  /* ================= LOAD TODAY SUMMARY ================= */
  const loadSummary = async () => {
    try {
      const res = await api.get(`/attendance/employee/${employeeId}`);
      const today = new Date().toISOString().split("T")[0];

      const todayRecord = res.data.find(
        (r) => r.attendanceDate === today
      );

      if (todayRecord) {
        setSummary({
          work: todayRecord.totalWorkMinutes || 0,
          break: todayRecord.totalBreakMinutes || 0,
          idle: todayRecord.totalIdleMinutes || 0,
          productive: todayRecord.productiveMinutes || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  /* ================= ACTIONS ================= */
  const pause = async (type) => {
    try {
      await api.post("/attendance/pause", null, {
        params: { employeeId, type },
      });

      setStatus(type);
      stopTimer();
      loadSummary();
    } catch (err) {
      console.error("Pause failed", err.response?.data);
    }
  };

  const resume = async () => {
    try {
      await api.post("/attendance/resume", null, {
        params: { employeeId },
      });

      setStatus("WORK");
      startTimer();
      loadSummary();
    } catch (err) {
      console.error("Resume failed", err.response?.data);
    }
  };

  /* ================= IDLE TRACKING ================= */
  useEffect(() => {
    const markActive = async () => {
      if (status !== "WORK") return;

      await api.post("/attendance/active", null, {
        params: { employeeId },
      });

      clearTimeout(idleTimeoutRef.current);

      idleTimeoutRef.current = setTimeout(async () => {
        await api.post("/attendance/idle", null, {
          params: { employeeId },
        });

        setStatus("IDLE");
        stopTimer();
        loadSummary();
      }, 15 * 60 * 1000); // 15 minutes
    };

    window.addEventListener("mousemove", markActive);
    window.addEventListener("keydown", markActive);

    return () => {
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      clearTimeout(idleTimeoutRef.current);
    };
  }, [employeeId, status]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="tracker-container">
      <h2 className="tracker-title">My Work Session</h2>

      {/* STATUS + LIVE TIMER */}
      <div className="status-card">
        <div className={`status ${status.toLowerCase()}`}>{status}</div>
        <div className="timer">{formatSeconds(runningSeconds)}</div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="actions">
        <button onClick={() => pause("BREAK")} disabled={status !== "WORK"}>
          Break
        </button>
        <button onClick={() => pause("LUNCH")} disabled={status !== "WORK"}>
          Lunch
        </button>
        <button className="dark" onClick={resume} disabled={status === "WORK"}>
          Resume
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        <Summary title="Total Work" value={summary.work} />
        <Summary title="Productive" value={summary.productive} />
        <Summary title="Idle" value={summary.idle} />
        <Summary title="Total Break" value={summary.break} />
      </div>
    </div>
  );
};

/* ================= SUMMARY CARD ================= */
const Summary = ({ title, value }) => (
  <div className="summary-card">
    <p>{title}</p>
    <h4>{formatDuration(value)}</h4>
  </div>
);

export default EmployeeWorkTracker;
