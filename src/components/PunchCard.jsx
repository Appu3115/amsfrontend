import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/PunchCard.css";
import { getUser } from "../utils/auth";
import EmployeeWorkTracker from "./EmployeeWorkTracker";
/* ---------- CONSTANTS (MATCH BACKEND ENUMS) ---------- */
const PERMISSION_OPTIONS = [
  { label: "30 Minutes", minutes: 30, duration: "HOURLY" },
  { label: "1 Hour", minutes: 60, duration: "HOURLY" },
  { label: "1.5 Hours", minutes: 90, duration: "HOURLY" },
  { label: "2 Hours", minutes: 120, duration: "HOURLY" },
  { label: "2.5 Hours", minutes: 150, duration: "HOURLY" },
  { label: "3 Hours", minutes: 180, duration: "HOURLY" },
  { label: "Half Day", minutes: null, duration: "HALF_DAY" },
  { label: "Full Day", minutes: null, duration: "FULL_DAY" },
];

const PunchCard = () => {
  const user = getUser();
  const employeeId = user?.employeeId?.toUpperCase();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [workFromHome, setWorkFromHome] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginTime, setLoginTime] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [permission, setPermission] = useState(null);

  /* ===== SHIFT DATA ===== */
  const [workingMinutes, setWorkingMinutes] = useState(null);
  const [halfDayMinutes, setHalfDayMinutes] = useState(null);

  /* ================= ERROR HANDLER ================= */
  const getErrorMessage = (err, fallback) => {
    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        return err.response.data;
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
    }
    return fallback;
  };

  /* ================= LOAD SHIFT ================= */
  useEffect(() => {
    if (!employeeId) return;

    const loadShift = async () => {
      try {
        const res = await api.get(`/shift/${employeeId}`);
        setWorkingMinutes(res.data.workingMinutes);
        setHalfDayMinutes(res.data.halfDayMinutes);
      } catch (err) {
        console.log(err);
        console.error("Failed to load shift data");
      }
    };

    loadShift();
  }, [employeeId]);

  /* ================= RESTORE SESSION ================= */
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("emp_attendance_logged_in");
    const storedLoginTime = sessionStorage.getItem(
      "emp_attendance_login_time"
    );

    if (loggedIn === "true" && storedLoginTime) {
      const parsed = new Date(storedLoginTime);
      setIsLoggedIn(true);
      setLoginTime(parsed);
      setSeconds(
        Math.floor((Date.now() - parsed.getTime()) / 1000)
      );
    }
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!isLoggedIn || !loginTime) return;

    const start = new Date(loginTime).getTime();
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, loginTime]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ================= PUNCH IN ================= */
  const punchIn = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/attendance/login", null, {
        params: { employeeId, workFromHome },
      });

      const now = new Date();
      setIsLoggedIn(true);
      setLoginTime(now);
      setSeconds(0);

      sessionStorage.setItem("emp_attendance_logged_in", "true");
      sessionStorage.setItem(
        "emp_attendance_login_time",
        now.toISOString()
      );

      setWorkFromHome(false);
      setMessage(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Punch In failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUNCH OUT ================= */
  const punchOut = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/attendance/logout", null, {
        params: { employeeId },
      });

      setIsLoggedIn(false);
      setLoginTime(null);
      setSeconds(0);

      sessionStorage.removeItem("emp_attendance_logged_in");
      sessionStorage.removeItem("emp_attendance_login_time");

      setMessage(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Punch Out failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= PERMISSION ================= */
  const requestPermission = async (type) => {
    if (!permission) {
      setMessage("Please select permission duration");
      return;
    }

    let minutesToSend = 0;

    if (permission.duration === "HOURLY") {
      minutesToSend = permission.minutes;
    } else if (permission.duration === "HALF_DAY") {
      minutesToSend = halfDayMinutes;
    } else if (permission.duration === "FULL_DAY") {
      minutesToSend = workingMinutes;
    }

    if (!minutesToSend || minutesToSend <= 0) {
      setMessage("Unable to calculate permission minutes");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/attendance/permission", null, {
        params: {
          employeeId,
          type,
          duration: permission.duration,
          minutes: minutesToSend, // ✅ ALWAYS SENT
        },
      });

      setPermission(null);
      setMessage(res.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Permission request failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
  <div className="punch-layout">

    {/* LEFT PANEL */}
    <div className="punch-left">
      <div className="punch-card">
        <h3>Today Attendance</h3>

        {isLoggedIn ? (
          <>
            <div className="timer big">{formatTime(seconds)}</div>
            <p className="status active">
              WORKING {workFromHome && "(WFH)"}
            </p>

            <div className="permission">
              <select
                value={permission?.label || ""}
                onChange={(e) =>
                  setPermission(
                    PERMISSION_OPTIONS.find(
                      (p) => p.label === e.target.value
                    )
                  )
                }
              >
                <option value="">Early Leave Permission</option>
                {PERMISSION_OPTIONS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>

              <button
                className="secondary"
                onClick={() => requestPermission("EARLY_OUT")}
                disabled={loading}
              >
                Request
              </button>
            </div>

            <button
              className="danger full"
              onClick={punchOut}
              disabled={loading}
            >
              Punch Out
            </button>
          </>
        ) : (
          <>
            <div className="permission">
              <select
                value={permission?.label || ""}
                onChange={(e) =>
                  setPermission(
                    PERMISSION_OPTIONS.find(
                      (p) => p.label === e.target.value
                    )
                  )
                }
              >
                <option value="">Late In Permission</option>
                {PERMISSION_OPTIONS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>

              <button
                className="secondary"
                onClick={() => requestPermission("LATE_IN")}
                disabled={loading}
              >
                Request
              </button>
            </div>

            <label className="wfh">
              <input
                type="checkbox"
                checked={workFromHome}
                onChange={(e) => setWorkFromHome(e.target.checked)}
              />
              Work From Home
            </label>

            <button
              className="primary full"
              onClick={punchIn}
              disabled={loading}
            >
              Punch In
            </button>
          </>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="punch-right">
      {isLoggedIn && (
        <EmployeeWorkTracker employeeId={employeeId} />
      )}
    </div>

  </div>
);

};

export default PunchCard;
