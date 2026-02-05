import React, { useState } from "react";
import "../styles/EmployeeDashboard.css";

import AttendanceHistory from "../components/AttendanceHistory";
import EmployeeLeaveRecords from "../components/EmployeeLeaveRecords";
import ProfileForm from "../components/ProfileForm";
import PunchCard from "../components/PunchCard";
import { getUser, logout } from "../utils/auth";
import HolidayList from "../components/HolidayList";
import EmployeeLeaveBalance from "../components/EmployeeLeaveBalance";
import { useNavigate } from "react-router-dom";
import EmployeeReports from "../components/EmployeeReports";
import {
  FaHome,
  FaCalendarCheck,
  FaHistory,
  FaUser,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

/* ---------- Employee Dashboard ---------- */
const EmployeeDashboard = () => {
  const user = getUser();
const navigate = useNavigate();

  const firstName = user?.firstName || "Employee";
  const lastName = user?.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  // ✅ Persist active menu
  const [activeMenu, setActiveMenu] = useState(
    sessionStorage.getItem("employee_active_menu") || "dashboard"
  );

  /* ================= MENU HANDLER ================= */
  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    sessionStorage.setItem("employee_active_menu", menu);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.removeItem("employee_active_menu");
    logout(navigate);
  };

  return (
    <div className="emp-layout">
      {/* ---------- Sidebar ---------- */}
      <aside className="emp-sidebar">
        <div className="emp-logo">AMS Employee</div>

        <nav className="emp-nav">
          {[
            ["dashboard", "Dashboard", <FaHome />],
            ["attendance", "Attendance", <FaCalendarCheck />],
            ["history", "Leave History", <FaHistory />],
            // ["leaveBalance", "Leave Balance", <FaChartBar />],
            ["holidays", "Holidays", <FaCalendarCheck />],
            ["statistics", "Statistics", <FaChartBar />],
            ["profile", "Profile", <FaUser />],
          ].map(([key, label, icon]) => (
            <div
              key={key}
              className={`emp-nav-item ${activeMenu === key ? "active" : ""}`}
              onClick={() => handleMenuChange(key)}
            >
              <span className="emp-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}

          <div className="emp-nav-item logout" onClick={handleLogout}>
            <FaSignOutAlt className="emp-icon" />
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="emp-main">
        <header className="emp-navbar">
          <h3>Employee Dashboard</h3>
          <div className="emp-user">
            <div className="emp-avatar-circle">{avatarLetter}</div>
            <span>
              {firstName} {lastName}
            </span>
          </div>
        </header>

        <main className="emp-content">
          {/* ---------- DASHBOARD ---------- */}
          {activeMenu === "dashboard" && (
            <div className="emp-dashboard">
              <div className="emp-dashboard-header">
                <h2>Welcome, {firstName} 👋</h2>
                <p>
                  Track your workday, manage attendance, and request permissions.
                </p>
              </div>

              <div className="emp-dashboard-content">
                <PunchCard />
              </div>

              {/* 🔥 Leave Balance Snapshot */}
              <div style={{ marginTop: "32px" }}>
                <EmployeeLeaveBalance />
              </div>
            </div>
          )}

          {/* ---------- ATTENDANCE ---------- */}
          {activeMenu === "attendance" && <AttendanceHistory />}

          {/* ---------- LEAVE BALANCE ---------- */}
          {/* {activeMenu === "leaveBalance" && (
            <div className="emp-leave-balance-section">
              <EmployeeLeaveBalance />
            </div>
          )} */}

          {/* ---------- LEAVE HISTORY ---------- */}
          {activeMenu === "history" && <EmployeeLeaveRecords />}

          {/* ---------- HOLIDAYS ---------- */}
          {activeMenu === "holidays" && (
            <div className="emp-holiday-section">
              <HolidayList title="Company Holidays" />
            </div>
          )}

          {/* ---------- STATISTICS ---------- */}
          {/* ---------- STATISTICS (REPORTS) ---------- */}
          {activeMenu === "statistics" && (
            <div className="emp-statistics-page">
              <EmployeeReports /> {/* ✅ REAL REPORTS HERE */}
            </div>
          )}

          {/* ---------- PROFILE ---------- */}
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
