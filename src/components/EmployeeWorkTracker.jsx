import { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axios";
import "../styles/EmployeeWorkTracker.css";

/* ================= TIME FORMAT ================= */
const formatSeconds = (seconds = 0) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const formatMinutes = (minutes = 0) =>
  formatSeconds(minutes * 60);

/* ================= COMPONENT ================= */
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
  const heartbeatRef = useRef(null);
  const lastPulseRef = useRef(0);

  /* ================= TIMER ================= */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (initialSeconds = 0) => {
    stopTimer();
    setRunningSeconds(initialSeconds);

    timerRef.current = setInterval(() => {
      setRunningSeconds((prev) => prev + 1);
    }, 1000);
  };

  /* ================= ACTIVITY PULSE ================= */
  const sendPulse = useCallback(
    async (type) => {
      const now = Date.now();

      // ⏱ throttle real activity (avoid DB spam)
      if (type !== "HEARTBEAT" && now - lastPulseRef.current < 3000) {
        return;
      }

      lastPulseRef.current = now;

      try {
        await api.post("/api/activity/pulse", null, {
          params: { employeeId, type },
        });
      } catch (err) {
        console.error("Pulse failed", type, err);
      }
    },
    [employeeId]
  );

  /* ================= LOAD CURRENT SESSION ================= */
  const loadCurrentStatus = useCallback(async () => {
    try {
      const res = await api.get(`/attendance/current/${employeeId}`);

      const {
        loggedIn,
        status: backendStatus,
        runningSeconds: backendSeconds,
      } = res.data;

      stopTimer();

      if (!loggedIn) {
        setStatus("IDLE");
        setRunningSeconds(0);
        return;
      }

      setStatus(backendStatus);

      if (backendStatus !== "IDLE") {
        startTimer(backendSeconds ?? 0);
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

      if (!todayRecord) {
        setSummary({ work: 0, break: 0, idle: 0, productive: 0 });
        return;
      }

      setSummary({
        work: todayRecord.totalWorkMinutes ?? 0,
        break: todayRecord.totalBreakMinutes ?? 0,
        idle: todayRecord.idleMinutes ?? 0,
        productive: todayRecord.productiveMinutes ?? 0,
      });
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  }, [employeeId]);

  /* ================= ACTIONS ================= */
  const pause = async (type) => {
    try {
      await api.post("/attendance/pause", null, {
        params: { employeeId, type },
      });
      await loadCurrentStatus();
    } catch (err) {
      console.error("Pause failed", err);
      await loadCurrentStatus();
    }
  };

  const resume = async () => {
    try {
      await api.post("/attendance/resume", null, {
        params: { employeeId },
      });

      await Promise.all([loadCurrentStatus(), loadSummary()]);
    } catch (err) {
      console.error("Resume failed", err);
      await loadCurrentStatus();
    }
  };

  /* ================= ACTIVITY LISTENERS ================= */
  useEffect(() => {
    const onMouse = () => sendPulse("MOUSE");
    const onKey = () => sendPulse("KEYBOARD");
    const onFocus = () => sendPulse("SCREEN_ACTIVE");

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mousedown", onMouse);
    window.addEventListener("keydown", onKey);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) sendPulse("SCREEN_ACTIVE");
    });

    // ❤️ Heartbeat (important for long idle tabs)
    heartbeatRef.current = setInterval(() => {
      sendPulse("HEARTBEAT");
    }, 30_000);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mousedown", onMouse);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focus", onFocus);

      clearInterval(heartbeatRef.current);
      stopTimer();
    };
  }, [sendPulse]);

  /* ================= INITIAL LOAD ================= */
 useEffect(() => {
  loadCurrentStatus();
  loadSummary();

  return () => stopTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [employeeId]);


  /* ================= UI ================= */
  const isWorking = status === "WORK";
  const isPaused = status === "BREAK" || status === "LUNCH";

  return (
    <div className="tracker-container">
      <h2 className="tracker-title">My Work Session</h2>

      <div className="status-card">
        <div className={`status ${status.toLowerCase()}`}>
          {status}
        </div>
        <div className="timer">
          {formatSeconds(runningSeconds)}
        </div>
      </div>

      <div className="actions">
        <button onClick={() => pause("BREAK")} disabled={!isWorking}>
          Break
        </button>

        <button onClick={() => pause("LUNCH")} disabled={!isWorking}>
          Lunch
        </button>

        <button className="dark" onClick={resume} disabled={!isPaused}>
          Resume
        </button>
      </div>

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
    <h4>{formatMinutes(value)}</h4>
  </div>
);

export default EmployeeWorkTracker;
