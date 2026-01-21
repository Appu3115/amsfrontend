import React, { useState } from "react";
import "../styles/EmployeeDashboard.css";

import AttendanceHistory from "../components/AttendanceHistory";
import EmployeeLeaveRecords from "../components/EmployeeLeaveRecords";
import ProfileForm from "../components/ProfileForm";
import PunchCard from "../components/PunchCard";
import { getUser } from "../utils/auth";
import HolidayList from "../components/HolidayList";
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

  const firstName = user?.firstName || "Employee";
  const lastName = user?.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const [activeMenu, setActiveMenu] = useState("dashboard");

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
             ["holidays", "Holidays", <FaCalendarCheck />], 
            ["statistics", "Statistics", <FaChartBar />],
            ["profile", "Profile", <FaUser />],
          ].map(([key, label, icon]) => (
            <div
              key={key}
              className={`emp-nav-item ${activeMenu === key ? "active" : ""}`}
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
  </div>
)}


          {/* ---------- ATTENDANCE ---------- */}
          {activeMenu === "attendance" && <AttendanceHistory />}

          {/* ---------- LEAVE HISTORY ---------- */}
          {activeMenu === "history" && <EmployeeLeaveRecords />}

{/* ---------- HOLIDAYS ---------- */}
{activeMenu === "holidays" && (
  <div className="emp-holiday-section">
    <HolidayList title="Company Holidays" />
  </div>
)}

          {/* ---------- STATISTICS PAGE ---------- */}
          {activeMenu === "statistics" && (
            <div className="emp-statistics-page">
              <h2>Attendance Statistics</h2>

              <div className="emp-stat-grid">
                <div className="emp-stat-card">
                  <span>Total Working Days</span>
                  <strong>22</strong>
                </div>

                <div className="emp-stat-card">
                  <span>Present Days</span>
                  <strong>18</strong>
                </div>

                <div className="emp-stat-card">
                  <span>Absent Days</span>
                  <strong>2</strong>
                </div>

                <div className="emp-stat-card">
                  <span>Leave Days</span>
                  <strong>2</strong>
                </div>
              </div>

              <p className="emp-stat-note">
                * Statistics shown are sample values. Backend integration
                can be added later.
              </p>
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
