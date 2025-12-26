import AddDepartment from "../components/AddDepartment";
import Shifts from "../components/Shifts";
import { useState } from "react";
import AllEmployee from "../components/AllEmployee";

import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaClock,
  FaCalendarCheck,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const stats = [
    { title: "Total Employees", value: 45 },
    { title: "Present Today", value: 38 },
    { title: "Absent Today", value: 5 },
    { title: "On Leave", value: 2 },
    { title: "Late Check-ins", value: 4 },
  ];

  return (
    <div className="admin-container">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="logo">AMS</h2>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("dashboard")}
          >
            <FaTachometerAlt className="icon" />
            <span className="link-text">Dashboard</span>
          </button>

        <button
  className={`nav-link ${activePage === "employees" ? "active" : ""}`}
  onClick={() => setActivePage("employees")}
>
  <FaUsers className="icon" />
  <span className="link-text">Employees</span>
</button>


          <button
            className={`nav-link ${activePage === "departments" ? "active" : ""}`}
            onClick={() => setActivePage("departments")}
          >
            <FaBuilding className="icon" />
            <span className="link-text">Departments</span>
          </button>

          <button
            className={`nav-link ${activePage === "shifts" ? "active" : ""}`}
            onClick={() => setActivePage("shifts")}
          >
            <FaClock className="icon" />
            <span className="link-text">Shifts</span>
          </button>

          {/* ✅ ATTENDANCE BUTTON */}
          <button
            className={`nav-link ${activePage === "attendance" ? "active" : ""}`}
            onClick={() => setActivePage("attendance")}
          >
            <FaCalendarCheck className="icon" />
            <span className="link-text">Attendance</span>
          </button>

          <button className="nav-link">
            <FaFileAlt className="icon" />
            <span className="link-text">Reports</span>
          </button>

          <button className="nav-link">
            <FaCog className="icon" />
            <span className="link-text">Settings</span>
          </button>
        </nav>

        <div className="sidebar-logout">
          <button className="logout-btn">
            <FaSignOutAlt className="icon" />
            <span className="link-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        <header className="navbar">
          <h3>Admin Dashboard</h3>
          <span className="admin-name">Admin</span>
        </header>

        <section className="page-content">
          {/* ===== Dashboard Overview ===== */}
          {activePage === "dashboard" && (
            <>
              <h2>Overview</h2>
              <div className="stats-grid">
                {stats.map((item, index) => (
                  <div key={index} className="stat-card">
                    <p className="card-title">{item.title}</p>
                    <h1 className="card-value">{item.value}</h1>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===== Departments ===== */}
          {activePage === "departments" && <AddDepartment />}

          {/* ===== Shifts ===== */}
          {activePage === "shifts" && <Shifts />}

          {/* ✅ ATTENDANCE DASHBOARD */}
          {activePage === "attendance" && <AttendanceDashboard />}
          {/* ===== Employees ===== */}
           {activePage === "employees" && <AllEmployee />}

        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
