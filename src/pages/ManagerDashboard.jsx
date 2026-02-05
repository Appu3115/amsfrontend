import { useState, useEffect } from "react";
import {
  FaUsers,
  FaCalendarCheck,
  FaClock,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaUser
} from "react-icons/fa";

import CreateEmployeeModal from "../components/CreateEmployeeModel";
import { getUser, getRole, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../styles/ManagerDashboard.css";
import ManagerReports from "../components/ManagerReports";

import ProfileForm from "../components/ProfileForm";
import DepartmentEmployees from "../components/DepartmentEmployees";
import DepartmentAttendance from "../components/DepartmentAttendance";
import DepartmentLeaveRequests from "../components/DepartmentLeaveRequests";
import HolidayList from "../components/HolidayList";
import PunchCard from "../components/PunchCard";
import EmployeeLeaveBalance from "../components/EmployeeLeaveBalance";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Persist active tab using localStorage
  const [activeTab, setActiveTab] = useState(
    sessionStorage.getItem("manager_active_tab") || "dashboard"
  );

  const [openModal, setOpenModal] = useState(false);

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

  /* ================= TAB HANDLER ================= */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("manager_active_tab", tab);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    sessionStorage.removeItem("manager_active_tab");
    logout(navigate);
  };

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
            onClick={() => handleTabChange("dashboard")}
          />

          <SidebarItem
            icon={<FaUsers />}
            label="Employees"
            active={activeTab === "employees"}
            onClick={() => handleTabChange("employees")}
          />

          <SidebarItem
            icon={<FaCalendarCheck />}
            label="Attendance"
            active={activeTab === "attendance"}
            onClick={() => handleTabChange("attendance")}
          />

          {/* <SidebarItem
            icon={<FaClock />}
            label="My Attendance"
            active={activeTab === "myAttendance"}
            onClick={() => handleTabChange("myAttendance")}
          /> */}

          <SidebarItem
            icon={<FaClock />}
            label="Leave Requests"
            active={activeTab === "leave"}
            onClick={() => handleTabChange("leave")}
          />

          {/* <SidebarItem
            icon={<FaChartBar />}
            label="My Leave Balance"
            active={activeTab === "myLeaveBalance"}
            onClick={() => handleTabChange("myLeaveBalance")}
          /> */}

          <SidebarItem
            icon={<FaCalendarCheck />}
            label="Holidays"
            active={activeTab === "holidays"}
            onClick={() => handleTabChange("holidays")}
          />
          <SidebarItem
  icon={<FaChartBar />}
  label="Reports"
  active={activeTab === "reports"}
  onClick={() => handleTabChange("reports")}
/>


          <SidebarItem
            icon={<FaUser />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => handleTabChange("profile")}
          />
        </nav>

        <div className="sidebar-footer">
          <SidebarItem
            icon={<FaSignOutAlt />}
            label="Logout"
            onClick={handleLogout}
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
              {/* <h3>Overview</h3> */}
              <p>Welcome back, {user.firstName} 👋</p>
               {/* <h3>My Attendance</h3> */}
              <PunchCard />
              <EmployeeLeaveBalance />
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

          {/* {activeTab === "myAttendance" && (
            <>
              <h3>My Attendance</h3>
              <PunchCard />
            </>
          )} */}

          {/* {activeTab === "myLeaveBalance" && (
            <>
              <h3>My Leave Balance</h3>
              <EmployeeLeaveBalance />
            </>
          )} */}
{activeTab === "reports" && (
  <>
    <h3>Department Reports</h3>
    <ManagerReports />
  </>
)}

          {activeTab === "profile" && <ProfileForm />}

          {activeTab === "holidays" && <HolidayList />}
          
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <CreateEmployeeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
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
