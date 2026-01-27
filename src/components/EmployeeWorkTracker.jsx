import { useEffect, useRef, useState, useCallback } from "react";
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
  const [status, setStatus] = useState("IDLE");
  const [runningSeconds, setRunningSeconds] = useState(0);

  const [summary, setSummary] = useState({
    work: 0,
    break: 0,
    idle: 0,
    productive: 0,
  });

  const timerRef = useRef(null);

  /* ================= TIMER ================= */
  const startTimer = (initialSeconds = 0) => {
    stopTimer();
    setRunningSeconds(initialSeconds);

    timerRef.current = setInterval(() => {
      setRunningSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ================= LOAD CURRENT SESSION ================= */
  const loadCurrentStatus = useCallback(async () => {
    try {
      const res = await api.get(`/attendance/current/${employeeId}`);
      const { loggedIn, status, runningSeconds } = res.data;

      stopTimer();

      if (!loggedIn) {
        setStatus("IDLE");
        setRunningSeconds(0);
        return;
      }

      setStatus(status);

      if (status !== "IDLE") {
        startTimer(runningSeconds || 0);
      } else {
        setRunningSeconds(0);
      }
    } catch (err) {
      console.error("Failed to load current session", err);
    }
  }, [employeeId]);

  /* ================= LOAD SUMMARY ================= */
  const loadSummary = useCallback(async () => {
    try {
      const res = await api.get(`/attendance/employee/${employeeId}`);
      const today = new Date().toISOString().split("T")[0];

      const todayRecord = Array.isArray(res.data)
        ? res.data.find((r) => r.attendanceDate === today)
        : null;

      if (todayRecord) {
        setSummary({
          work: todayRecord.totalWorkMinutes ?? 0,
          break: todayRecord.totalBreakMinutes ?? 0,
          idle: todayRecord.idleMinutes ?? 0,
          productive: todayRecord.productiveMinutes ?? 0,
        });
      } else {
        setSummary({ work: 0, break: 0, idle: 0, productive: 0 });
      }
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  }, [employeeId]);

  /* ================= ACTIONS ================= */

  const pause = async (type) => {
    // 🔥 Instant UI update
    setStatus(type);
    startTimer(0);

    try {
      await api.post("/attendance/pause", null, {
        params: { employeeId, type },
      });

      await loadCurrentStatus();
    } catch (err) {
      console.error("Pause failed", err);
      await loadCurrentStatus(); // rollback
    }
  };

  const resume = async () => {
    // 🔥 Instant UI update
    setStatus("WORK");
    startTimer(0);

    try {
      await api.post("/attendance/resume", null, {
        params: { employeeId },
      });

      // Sync backend truth
      await Promise.all([
        loadCurrentStatus(),
        loadSummary(),
      ]);
    } catch (err) {
      console.error("Resume failed", err);
      await loadCurrentStatus(); // rollback
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadCurrentStatus();
    loadSummary();

    return () => stopTimer();
  }, [loadCurrentStatus, loadSummary]);

  return (
    <div className="tracker-container">
      <h2 className="tracker-title">My Work Session</h2>

      {/* STATUS + TIMER */}
      <div className="status-card">
        <div className={`status ${status.toLowerCase()}`}>
          {status}
        </div>
        <div className="timer">
          {formatSeconds(runningSeconds)}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button
          type="button"
          onClick={() => pause("BREAK")}
          disabled={status !== "WORK"}
        >
          Break
        </button>

        <button
          type="button"
          onClick={() => pause("LUNCH")}
          disabled={status !== "WORK"}
        >
          Lunch
        </button>

        <button
          type="button"
          className="dark"
          onClick={resume}
          disabled={status === "WORK"}
        >
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
