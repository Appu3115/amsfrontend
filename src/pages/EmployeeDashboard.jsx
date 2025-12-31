import React, { useEffect, useState } from "react";
import "../styles/EmployeeDashboard.css";

import LeaveRequest from "../components/LeaveRequest";
import AttendanceHistory from "../components/AttendanceHistory";
import WeeklyAttendanceChart from "../components/WeeklyAttendanceChart";
import MonthlyAttendanceChart from "../components/MonthlyAttendanceChart";
import AttendancePieChart from "../components/AttendancePieChart";

import api from "../api/axios";

import {
  FaHome,
  FaCalendarCheck,
  FaRegCalendarPlus,
  FaHistory,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";

/* ================= Helpers ================= */
const formatTime12H = (dateTime) =>
  dateTime
    ? new Date(dateTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
};

const EmployeeDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const employeeId = user.employeeId;

  const firstName = user.firstName || "Employee";
  const lastName = user.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showLeave, setShowLeave] = useState(false);

  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMsg, setPunchMsg] = useState("");
  const [workFromHome, setWorkFromHome] = useState(false);

  const [runningSeconds, setRunningSeconds] = useState(0);

  /* ================= Fetch Attendance ================= */
  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/fetch", {
        params: { employeeId },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setAttendance(data);

      const today = new Date().toISOString().split("T")[0];
      setTodayAttendance(
        data.find((a) => a.attendanceDate === today) || null
      );
    } catch (err) {
      console.error("Attendance fetch failed", err);
    }
  };

  useEffect(() => {
    if (employeeId) fetchAttendance();
  }, [employeeId]);

  /* ================= Auto Refresh (30s) ================= */
  useEffect(() => {
    if (!employeeId) return;

    const interval = setInterval(() => {
      if (!punchLoading) fetchAttendance();
    }, 30000);

    return () => clearInterval(interval);
  }, [employeeId, punchLoading]);

  /* ================= Timer ================= */
  useEffect(() => {
    if (!todayAttendance || todayAttendance.logout) {
      setRunningSeconds(0);
      return;
    }

    const loginTime = new Date(todayAttendance.login).getTime();

    const interval = setInterval(() => {
      setRunningSeconds(
        Math.floor((Date.now() - loginTime) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  /* ================= Punch In ================= */
  const handlePunchIn = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg("");

      await api.post("/attendance/login", null, {
        params: { employeeId, workFromHome },
      });

      setPunchMsg("✅ Punch In successful");
      setWorkFromHome(false);
      fetchAttendance();
    } catch (err) {
      setPunchMsg(err.response?.data || "Punch In failed");
      fetchAttendance();
    } finally {
      setPunchLoading(false);
    }
  };

  /* ================= Punch Out ================= */
  const handlePunchOut = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg("");

      await api.post("/attendance/logout", null, {
        params: { employeeId },
      });

      setPunchMsg("✅ Punch Out successful");
      fetchAttendance();
    } catch (err) {
      setPunchMsg(err.response?.data || "Punch Out failed");
    } finally {
      setPunchLoading(false);
    }
  };

  return (
    <div className="emp-layout">
      {/* ================= Sidebar ================= */}
      <aside className="emp-sidebar">
        <div className="emp-logo">AMS Employee</div>

        <nav className="emp-nav">
          {[
            ["dashboard", "Dashboard", <FaHome />],
            ["attendance", "Attendance", <FaCalendarCheck />],
            ["applyLeave", "Apply Leave", <FaRegCalendarPlus />],
            ["history", "Leave History", <FaHistory />],
            ["profile", "Profile", <FaUser />],
            ["shifts", "Shifts", <FaTimeline />],
          ].map(([key, label, icon]) => (
            <div
              key={key}
              className={`emp-nav-item ${
                activeMenu === key ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(key);
                setShowLeave(key === "applyLeave");
              }}
            >
              <span className="emp-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}

          <div className="emp-nav-item logout">
            <FaSignOutAlt className="emp-icon" />
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      {showLeave && <LeaveRequest onClose={() => setShowLeave(false)} />}

      {/* ================= Main ================= */}
      <div className="emp-main">
        <header className="emp-navbar">
          <h3>Employee Dashboard</h3>
          <div className="emp-user">
            <div className="emp-avatar-circle">{avatarLetter}</div>
            <span>{firstName} {lastName}</span>
          </div>
        </header>

        <main className="emp-content">
          {activeMenu === "dashboard" && (
            <>
              {/* ================= Punch Card ================= */}
              <div className="emp-punch-card">
                <h3>Today Attendance</h3>

                {todayAttendance && !todayAttendance.logout && (
                  <>
                    <p>
                      <strong>Login:</strong>{" "}
                      {formatTime12H(todayAttendance.login)}
                    </p>
                    <div className="emp-timer">
                      ⏱ {formatDuration(runningSeconds)}
                    </div>
                    <button
                      className="punch-btn punch-out"
                      onClick={handlePunchOut}
                      disabled={punchLoading}
                    >
                      Punch Out
                    </button>
                  </>
                )}

                {!todayAttendance && (
                  <>
                    <label className="wfh-toggle">
                      <input
                        type="checkbox"
                        checked={workFromHome}
                        onChange={(e) =>
                          setWorkFromHome(e.target.checked)
                        }
                      />
                      Work From Home
                    </label>
                    <button
                      className="punch-btn punch-in"
                      onClick={handlePunchIn}
                      disabled={punchLoading}
                    >
                      Punch In
                    </button>
                  </>
                )}

                {todayAttendance?.logout && (
                  <p className="punch-complete">
                    ✅ Attendance completed
                  </p>
                )}

                {punchMsg && <p className="punch-msg">{punchMsg}</p>}
              </div>

              {/* ================= Charts ================= */}
              <div className="emp-charts">
                <div className="emp-chart-card">
                  <WeeklyAttendanceChart attendance={attendance} />
                </div>

                <div className="emp-chart-card">
                  <MonthlyAttendanceChart attendance={attendance} />
                </div>
              </div>

              <div className="emp-pie-wrapper">
                <AttendancePieChart attendance={attendance} />
              </div>
            </>
          )}

          {activeMenu === "attendance" && <AttendanceHistory />}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
