import { useState, useEffect } from "react";
import {
  FaUsers,
  FaCalendarCheck,
  FaClock,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaUser,
  FaKey
} from "react-icons/fa";

import CreateEmployeeModal from "../components/CreateEmployeeModel";
import ChangePassword from "../components/ChangePassword";
import { getUser, getRole, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerDashboard.css";
import ProfileForm from "../components/ProfileForm";
import DepartmentEmployees from "../components/DepartmentEmployees";
import DepartmentAttendance from "../components/DepartmentAttendance";
import DepartmentLeaveRequests from "../components/DepartmentLeaveRequests";
const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openModal, setOpenModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const loggedUser = getUser();
    const loggedRole = getRole();

    if (!loggedUser || loggedRole !== "MANAGER") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const user = getUser();
  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-logo">AMS</div>

        <nav className="sidebar-menu">
          <SidebarItem
            icon={<FaChartBar />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />

          <SidebarItem
            icon={<FaUsers />}
            label="Employees"
            active={activeTab === "employees"}
            onClick={() => setActiveTab("employees")}
          />

          <SidebarItem
            icon={<FaCalendarCheck />}
            label="Attendance"
            active={activeTab === "attendance"}
            onClick={() => setActiveTab("attendance")}
          />

          <SidebarItem
            icon={<FaClock />}
            label="Leave Requests"
            active={activeTab === "leave"}
            onClick={() => setActiveTab("leave")}
          />

          <SidebarItem
            icon={<FaUser />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </nav>

        <div className="sidebar-footer">
          <SidebarItem
            icon={<FaSignOutAlt />}
            label="Logout"
            onClick={() => logout(navigate)}
          />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <FaBars
              className="menu-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <h2>Manager Dashboard</h2>
          </div>

          <div className="navbar-right">
            <div className="avatar-circle">
              {user.firstName?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.firstName}</span>
          </div>
        </header>

        <div className="content-area">
          {activeTab === "dashboard" && (
            <>
              <h3>Overview</h3>
              <p>Welcome back, {user.firstName} 👋</p>
            </>
          )}


          {activeTab === "employees" && (
  <>
    <div className="content-header">
      <h3>Employees</h3>
      <button
        className="btn-primary"
        onClick={() => setOpenModal(true)}
      >
        + Create Employee
      </button>
    </div>
    <DepartmentEmployees />
  </>
)}
{activeTab === "attendance" && (
  <>
    <h3>Department Attendance</h3>
    <DepartmentAttendance />
  </>
)}
{activeTab === "leave" && (
  <>
    <h3>Department Leave Requests</h3>
    <DepartmentLeaveRequests />
  </>
)}


          {activeTab === "profile" && (
  <>
    <ProfileForm />
    <div style={{ marginTop: "24px" }}>
      <button
        className="btn-primary"
        onClick={() => setShowChangePassword(true)}
      >
        <FaKey /> Change Password
      </button>
    </div>
  </>
)}

        </div>
      </div>

      {/* ================= MODALS ================= */}
      <CreateEmployeeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

/* ================= SIDEBAR ITEM ================= */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    className={`sidebar-item ${active ? "active" : ""}`}
    onClick={onClick}
  >
    <span className="icon">{icon}</span>
    <span className="text">{label}</span>
  </div>
);

export default ManagerDashboard;
