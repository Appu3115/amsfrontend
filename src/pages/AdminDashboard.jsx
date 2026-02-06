import AddDepartment from "../components/AddDepartment";
import Shifts from "../components/Shifts";
import { useState } from "react";
import AllEmployee from "../components/AllEmployee";
import AllLeaveRequests from "../components/AllLeaveRequests";
import AdminAttendance from "../components/AdminAttendance";
import CreateManager from "../components/CreateManager";
import DailyCount from "../components/DailyCount";
import HolidayAdmin from "../components/HolidayAdmin";
import AdminReports from "../components/AdminReports";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaClock,
  FaCalendarCheck,
  FaCalendarAlt,
  FaFileAlt,
  FaSignOutAlt,
  FaClipboardList,
} from "react-icons/fa";

import { logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ✅ Persist active page
  const [activePage, setActivePage] = useState(
    sessionStorage.getItem("admin_active_page") || "dashboard"
  );

  const [showCreateManager, setShowCreateManager] = useState(false);

  /* ================= PAGE HANDLER ================= */
  const handlePageChange = (page) => {
    setActivePage(page);
    sessionStorage.setItem("admin_active_page", page);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.removeItem("admin_active_page");
    logout(navigate);
  };

  return (
    <div className="admin-container">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="logo">AMS</h2>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => handlePageChange("dashboard")}
          >
            <FaTachometerAlt className="icon" />
            <span className="link-text">Dashboard</span>
          </button>

          <button
            className={`nav-link ${activePage === "employees" ? "active" : ""}`}
            onClick={() => handlePageChange("employees")}
          >
            <FaUsers className="icon" />
            <span className="link-text">Employees</span>
          </button>

          <button
            className={`nav-link ${activePage === "departments" ? "active" : ""}`}
            onClick={() => handlePageChange("departments")}
          >
            <FaBuilding className="icon" />
            <span className="link-text">Departments</span>
          </button>

          <button
            className={`nav-link ${activePage === "shifts" ? "active" : ""}`}
            onClick={() => handlePageChange("shifts")}
          >
            <FaClock className="icon" />
            <span className="link-text">Shifts</span>
          </button>

          <button
            className={`nav-link ${activePage === "attendance" ? "active" : ""}`}
            onClick={() => handlePageChange("attendance")}
          >
            <FaCalendarCheck className="icon" />
            <span className="link-text">Attendance</span>
          </button>

          <button
            className={`nav-link ${activePage === "holidays" ? "active" : ""}`}
            onClick={() => handlePageChange("holidays")}
          >
            <FaCalendarAlt className="icon" />
            <span className="link-text">Holidays</span>
          </button>

          <button
            className={`nav-link ${activePage === "leaves" ? "active" : ""}`}
            onClick={() => handlePageChange("leaves")}
          >
            <FaClipboardList className="icon" />
            <span className="link-text">Leave Requests</span>
          </button>

          <button className={`nav-link ${activePage === "reports" ? "active":""}`}
          onClick={()=> handlePageChange("reports")}>
            <FaFileAlt className="icon" />
            <span className="link-text">Reports</span>
          </button>
        </nav>

        <div className="sidebar-logout">
          <button className="logout-btn" onClick={handleLogout}>
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
          {/* ===== Dashboard ===== */}
          {activePage === "dashboard" && <DailyCount />}

          {/* ===== Departments ===== */}
          {activePage === "departments" && <AddDepartment />}

          {/* ===== Shifts ===== */}
          {activePage === "shifts" && <Shifts />}

          {/* ===== Holidays ===== */}
          {activePage === "holidays" && <HolidayAdmin />}
          {activePage === "reports" && <AdminReports/>}
          {/* ===== Employees ===== */}
          {activePage === "employees" && (
            <>
              <div className="employees-header">
                <h2>Employees</h2>
                <button
                  className="create-manager-btn"
                  onClick={() => setShowCreateManager(true)}
                >
                  + Create Manager
                </button>
              </div>

              <AllEmployee />

              <CreateManager
                isOpen={showCreateManager}
                onClose={() => setShowCreateManager(false)}
                onSuccess={() => setShowCreateManager(false)}
              />
            </>
          )}

          {/* ===== Leave Requests ===== */}
          {activePage === "leaves" && <AllLeaveRequests />}

          {/* ===== Attendance ===== */}
          {activePage === "attendance" && <AdminAttendance />}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
