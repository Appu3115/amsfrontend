import React, { useState } from "react";
import "../styles/EmployeeDashboard.css";
import LeaveRequest from "../components/LeaveRequest";
import {
  FaHome,
  FaCalendarCheck,
  FaRegCalendarPlus,
  FaHistory,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

const EmployeeDashboard = () => {
  // 🔹 Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const firstName = user.firstName || "Employee";
  const lastName = user.lastName || "";
  const avatarLetter = firstName.charAt(0).toUpperCase();

  // 🔹 UI State
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showLeave, setShowLeave] = useState(false);

  return (
    <div className="emp-layout">
      {/* ===== Sidebar ===== */}
      <aside className="emp-sidebar">
        <div className="emp-logo">AMS Employee</div>

        <nav className="emp-nav">
          <div
            className={`emp-nav-item ${
              activeMenu === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActiveMenu("dashboard");
              setShowLeave(false);
            }}
          >
            <FaHome className="emp-icon" />
            <span>Dashboard</span>
          </div>

          <div
            className={`emp-nav-item ${
              activeMenu === "attendance" ? "active" : ""
            }`}
            onClick={() => {
              setActiveMenu("attendance");
              setShowLeave(false);
            }}
          >
            <FaCalendarCheck className="emp-icon" />
            <span>Attendance</span>
          </div>

          <div
            className={`emp-nav-item ${
              activeMenu === "applyLeave" ? "active" : ""
            }`}
            onClick={() => {
              setActiveMenu("applyLeave");
              setShowLeave(true);
            }}
          >
            <FaRegCalendarPlus className="emp-icon" />
            <span>Apply Leave</span>
          </div>

          <div
            className={`emp-nav-item ${
              activeMenu === "history" ? "active" : ""
            }`}
            onClick={() => {
              setActiveMenu("history");
              setShowLeave(false);
            }}
          >
            <FaHistory className="emp-icon" />
            <span>Leave History</span>
          </div>

          <div
            className={`emp-nav-item ${
              activeMenu === "profile" ? "active" : ""
            }`}
            onClick={() => {
              setActiveMenu("profile");
              setShowLeave(false);
            }}
          >
            <FaUser className="emp-icon" />
            <span>Profile</span>
          </div>

          <div className="emp-nav-item logout">
            <FaSignOutAlt className="emp-icon" />
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      {/* ===== Leave Popup ===== */}
      {showLeave && (
        <LeaveRequest onClose={() => setShowLeave(false)} />
      )}

      {/* ===== Main Area ===== */}
      <div className="emp-main">
        {/* Navbar */}
        <header className="emp-navbar">
          <h3>Employee Dashboard</h3>

          <div className="emp-user">
            <div className="emp-avatar-circle">{avatarLetter}</div>
            <span>
              {firstName} {lastName}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="emp-content">
          {/* Summary Cards */}
          <div className="emp-cards">
            <div className="emp-card">
              <h4>Present Days</h4>
              <p>22</p>
            </div>
            <div className="emp-card">
              <h4>Absent Days</h4>
              <p>2</p>
            </div>
            <div className="emp-card">
              <h4>Leaves Taken</h4>
              <p>3</p>
            </div>
            <div className="emp-card">
              <h4>Pending Leaves</h4>
              <p>1</p>
            </div>
          </div>

          {/* Recent Attendance */}
          <section className="emp-section">
            <h3>Recent Attendance</h3>
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-01-01</td>
                  <td>Present</td>
                  <td>09:10 AM</td>
                  <td>06:05 PM</td>
                </tr>
                <tr>
                  <td>2025-01-02</td>
                  <td>Present</td>
                  <td>09:05 AM</td>
                  <td>06:00 PM</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
