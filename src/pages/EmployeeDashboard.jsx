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

/* ===== Helpers ===== */
const formatTime12H = (dateTime) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

  /* ================= Fetch Attendance ================= */
  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/employeeid", {
        params: { EmployeeId: employeeId },
      });

      const data = res.data || [];
      setAttendance(data);

      const today = new Date().toISOString().split("T")[0];
      const todayRecord = data.find(
        (a) => a.attendanceDate === today
      );

      setTodayAttendance(todayRecord || null);
    } catch (err) {
      console.error("Attendance fetch failed", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* ================= Punch In ================= */
  const handlePunchIn = async () => {
    try {
      setPunchLoading(true);
      setPunchMsg("");

      await api.post("/attendance/login", null, {
        params: { EmployeeId: employeeId },
      });

      setPunchMsg("✅ Punch In successful");
      fetchAttendance();
    } catch (err) {
      setPunchMsg(err.response?.data || "Punch In failed");
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
      // 🔒 backend-controlled restriction message
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
          <div
            className={`emp-nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => { setActiveMenu("dashboard"); setShowLeave(false); }}
          >
            <FaHome className="emp-icon" />
            <span>Dashboard</span>
          </div>

          <div
            className={`emp-nav-item ${activeMenu === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveMenu("attendance"); setShowLeave(false); }}
          >
            <FaCalendarCheck className="emp-icon" />
            <span>Attendance</span>
          </div>

          <div
            className={`emp-nav-item ${activeMenu === "applyLeave" ? "active" : ""}`}
            onClick={() => { setActiveMenu("applyLeave"); setShowLeave(true); }}
          >
            <FaRegCalendarPlus className="emp-icon" />
            <span>Apply Leave</span>
          </div>

          <div
            className={`emp-nav-item ${activeMenu === "history" ? "active" : ""}`}
            onClick={() => { setActiveMenu("history"); setShowLeave(false); }}
          >
            <FaHistory className="emp-icon" />
            <span>Leave History</span>
          </div>

          <div
            className={`emp-nav-item ${activeMenu === "profile" ? "active" : ""}`}
            onClick={() => { setActiveMenu("profile"); setShowLeave(false); }}
          >
            <FaUser className="emp-icon" />
            <span>Profile</span>
          </div>

          <div
            className={`emp-nav-item ${activeMenu === "shifts" ? "active" : ""}`}
            onClick={() => { setActiveMenu("shifts"); setShowLeave(false); }}
          >
            <FaTimeline className="emp-icon" />
            <span>Shifts</span>
          </div>

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
          {/* ================= DASHBOARD ================= */}
          {activeMenu === "dashboard" && (
            <>
              {/* ===== Punch Card ===== */}
              <div className="emp-punch-card">
                <h3>Today Attendance</h3>

                {todayAttendance && (
                  <div className="emp-punch-times">
                    <p><strong>Login:</strong> {formatTime12H(todayAttendance.login)}</p>
                    <p><strong>Logout:</strong> {formatTime12H(todayAttendance.logout)}</p>
                  </div>
                )}

                {punchMsg && <p className="punch-msg">{punchMsg}</p>}

                {!todayAttendance && (
                  <button
                    className="punch-btn punch-in"
                    onClick={handlePunchIn}
                    disabled={punchLoading}
                  >
                    Punch In
                  </button>
                )}

                {todayAttendance && !todayAttendance.logout && (
                  <button
                    className="punch-btn punch-out"
                    onClick={handlePunchOut}
                    disabled={punchLoading}
                  >
                    Punch Out
                  </button>
                )}

                {todayAttendance && todayAttendance.logout && (
                  <p className="punch-complete">
                    ✅ Attendance completed for today
                  </p>
                )}
              </div>

              {/* ===== Charts ===== */}
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

          {/* ================= OTHER MENUS ================= */}
          {activeMenu === "attendance" && <AttendanceHistory />}
          {activeMenu === "history" && <h2>Leave History (Coming Soon)</h2>}
          {activeMenu === "profile" && <h2>Profile (Coming Soon)</h2>}
          {activeMenu === "shifts" && <h2>Shift Details (Coming Soon)</h2>}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
