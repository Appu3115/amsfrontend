import React, { useEffect, useState } from "react";
import "../styles/EmployeeDashboard.css";

import AttendanceHistory from "../components/AttendanceHistory";
import EmployeeLeaveRecords from "../components/EmployeeLeaveRecords";
import WeeklyAttendanceChart from "../components/WeeklyAttendanceChart";
import MonthlyAttendanceChart from "../components/MonthlyAttendanceChart";
import AttendancePieChart from "../components/AttendancePieChart";
import WorkSessionControls from "../components/WorkSessionControls";
import useActivityTracker from "../hooks/useActivityTracker";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import ProfileForm from "../components/ProfileForm";

import {
  FaHome,
  FaCalendarCheck,
  FaHistory,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";

/* ---------- Helpers ---------- */
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
  const user = getUser();
  const employeeId = user?.employeeId?.toUpperCase();

  const firstName = user?.firstName || "Employee";
  const lastName = user?.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  /* ---------- State ---------- */
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMsg, setPunchMsg] = useState("");
  const [workFromHome, setWorkFromHome] = useState(false);

  const [runningSeconds, setRunningSeconds] = useState(0);
  const [productiveSeconds, setProductiveSeconds] = useState(0);

  const [permissionMinutes, setPermissionMinutes] = useState("");
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState("");

  useActivityTracker(
    employeeId,
    todayAttendance && !todayAttendance.logout
  );

  /* ---------- API Calls ---------- */
  const fetchProductiveTime = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await api.get(
        "/attendance/activity/productive-time",
        { params: { employeeId, date: today } }
      );
      setProductiveSeconds(res.data || 0);
    } catch(e) {
      console.log(e)
    }
  };

  const fetchAttendance = async () => {
    try {
      if (!employeeId) return;

      fetchProductiveTime();

      const res = await api.get(`/attendance/employee/${employeeId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setAttendance(data);

      const today = new Date().toISOString().split("T")[0];
      setTodayAttendance(
        data.find((a) => a.attendanceDate === today) || null
      );
    } catch(e) {
      console.log(e)
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchAttendance();
  }, [employeeId]);

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

  /* ---------- Punch ---------- */
  const handlePunchIn = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg("");
      await api.post("/attendance/login", null, {
        params: { employeeId, workFromHome },
      });
      setPunchMsg("Punch In successful");
      setWorkFromHome(false);
      fetchAttendance();
    } catch {
      setPunchMsg("Punch In failed");
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg("");
      await api.post("/attendance/logout", null, {
        params: { employeeId },
      });
      setPunchMsg("Punch Out successful");
      fetchAttendance();
    } catch {
      setPunchMsg("Punch Out failed");
    } finally {
      setPunchLoading(false);
    }
  };

  /* ---------- Permission ---------- */
  const handlePermissionRequest = async (type) => {
    if (!permissionMinutes || permissionMinutes <= 0) return;

    try {
      setPermissionLoading(true);
      setPermissionMsg("");

      await api.post("/attendance/permission", null, {
        params: {
          employeeId,
          minutes: permissionMinutes,
          type,
        },
      });

      setPermissionMsg(
        type === "LATE_IN"
          ? "Late punch-in permission recorded"
          : "Early leave permission recorded"
      );

      setPermissionMinutes("");
      fetchAttendance();
    } catch {
      setPermissionMsg("Permission request failed");
    } finally {
      setPermissionLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="emp-layout">
      <aside className="emp-sidebar">
        <div className="emp-logo">AMS Employee</div>

        <nav className="emp-nav">
          {[
            ["dashboard", "Dashboard", <FaHome />],
            ["attendance", "Attendance", <FaCalendarCheck />],
            ["history", "Leave History", <FaHistory />],
            ["profile", "Profile", <FaUser />],
          ].map(([key, label, icon]) => (
            <div
              key={key}
              className={`emp-nav-item ${
                activeMenu === key ? "active" : ""
              }`}
              onClick={() => setActiveMenu(key)}
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
            <div className="emp-dashboard-grid">
              <div className="emp-left-col">
                <div className="emp-punch-card">
                  <h3>Today Attendance</h3>

                  {todayAttendance && !todayAttendance.logout && (
                    <>
                      <p>
                        <strong>Login:</strong>{" "}
                        {formatTime12H(todayAttendance.login)}
                      </p>

                      <div className="emp-timer">
                        Working Hour ⏱ {formatDuration(runningSeconds)}
                      </div>

                      <WorkSessionControls />

                      <div className="emp-productive-time">
                        <span>Productive Time</span>
                        <strong>{formatDuration(productiveSeconds)}</strong>
                      </div>

                      <div className="permission-box">
                        <label>Early Leave Permission (minutes)</label>
                        <div className="permission-row">
                          <input
                            type="number"
                            value={permissionMinutes}
                            onChange={(e) =>
                              setPermissionMinutes(e.target.value)
                            }
                          />
                          <button
                            onClick={() =>
                              handlePermissionRequest("EARLY_OUT")
                            }
                            disabled={permissionLoading}
                          >
                            Request
                          </button>
                        </div>
                        {permissionMsg && <p>{permissionMsg}</p>}
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
                      <div className="permission-box">
                        <label>Late Punch-In Permission (minutes)</label>
                        <div className="permission-row">
                          <input
                            type="number"
                            value={permissionMinutes}
                            onChange={(e) =>
                              setPermissionMinutes(e.target.value)
                            }
                          />
                          <button
                            onClick={() =>
                              handlePermissionRequest("LATE_IN")
                            }
                            disabled={permissionLoading}
                          >
                            Request
                          </button>
                        </div>
                        {permissionMsg && <p>{permissionMsg}</p>}
                      </div>

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
                    <p>Attendance completed</p>
                  )}
                  {punchMsg && <p>{punchMsg}</p>}
                </div>
              </div>

              <div className="emp-right-col">
                <div className="emp-chart-card">
                  <WeeklyAttendanceChart attendance={attendance} />
                </div>
                <div className="emp-chart-card">
                  <MonthlyAttendanceChart attendance={attendance} />
                </div>
                <div className="emp-chart-card">
                  <AttendancePieChart attendance={attendance} />
                </div>
              </div>
            </div>
          )}

          {activeMenu === "attendance" && <AttendanceHistory />}

          {activeMenu === "history" && <EmployeeLeaveRecords />}

          {activeMenu === "profile" && (
            <div className="emp-profile-section">
              <ProfileForm />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
