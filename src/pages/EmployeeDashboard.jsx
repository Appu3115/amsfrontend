import React, { useState, useEffect } from "react";
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

const EmployeeDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const firstName = user.firstName || "Employee";
  const lastName = user.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const [attendance, setAttendance] = useState([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showLeave, setShowLeave] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      const employeeId = user.employeeId;
      const res = await api.get("/attendance/employeeid", {
        params: { EmployeeId: employeeId },
      });
      setAttendance(res.data || []);
    };
    fetchAttendance();
  }, []);

  return (
    <div className="emp-layout">

      {/* ================= Sidebar ================= */}
      <aside className="emp-sidebar">
        <div className="emp-logo">AMS Employee</div>

        <nav className="emp-nav">
          <div className={`emp-nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => { setActiveMenu("dashboard"); setShowLeave(false); }}>
            <FaHome className="emp-icon" />
            <span>Dashboard</span>
          </div>

          <div className={`emp-nav-item ${activeMenu === "attendance" ? "active" : ""}`}
            onClick={() => { setActiveMenu("attendance"); setShowLeave(false); }}>
            <FaCalendarCheck className="emp-icon" />
            <span>Attendance</span>
          </div>

          <div className={`emp-nav-item ${activeMenu === "applyLeave" ? "active" : ""}`}
            onClick={() => { setActiveMenu("applyLeave"); setShowLeave(true); }}>
            <FaRegCalendarPlus className="emp-icon" />
            <span>Apply Leave</span>
          </div>

          <div className={`emp-nav-item ${activeMenu === "history" ? "active" : ""}`}
            onClick={() => { setActiveMenu("history"); setShowLeave(false); }}>
            <FaHistory className="emp-icon" />
            <span>Leave History</span>
          </div>

          <div className={`emp-nav-item ${activeMenu === "profile" ? "active" : ""}`}
            onClick={() => { setActiveMenu("profile"); setShowLeave(false); }}>
            <FaUser className="emp-icon" />
            <span>Profile</span>
          </div>

          <div className={`emp-nav-item ${activeMenu === "shifts" ? "active" : ""}`}
            onClick={() => { setActiveMenu("shifts"); setShowLeave(false); }}>
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

          {/* ===== DASHBOARD ===== */}
          {activeMenu === "dashboard" && (
            <>
              <div className="emp-charts">
                <div className="emp-chart-card">
                  {/* <div className="emp-chart-title">📅 Weekly Attendance</div> */}
                  <div className="emp-chart-body">
                    <WeeklyAttendanceChart attendance={attendance} />
                  </div>
                </div>

                <div className="emp-chart-card">
                  {/* <div className="emp-chart-title">📆 Monthly Attendance</div> */}
                  <div className="emp-chart-body">
                    <MonthlyAttendanceChart attendance={attendance} />
                  </div>
                </div>
              </div>

              <div className="emp-pie-wrapper">
                {/* <div className="emp-chart-title">🥧 Attendance Overview</div> */}
                <AttendancePieChart attendance={attendance} />
              </div>
            </>
          )}

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
