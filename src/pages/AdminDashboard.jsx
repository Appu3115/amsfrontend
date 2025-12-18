import { NavLink } from "react-router-dom";
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
          <NavLink to="/admin/dashboard" className="nav-link">
            <FaTachometerAlt className="icon" />
            <span className="link-text">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/employees" className="nav-link">
            <FaUsers className="icon" />
            <span className="link-text">Employees</span>
          </NavLink>

          <NavLink to="/admin/departments" className="nav-link">
            <FaBuilding className="icon" />
            <span className="link-text">Departments</span>
          </NavLink>

          <NavLink to="/admin/shifts" className="nav-link">
            <FaClock className="icon" />
            <span className="link-text">Shifts</span>
          </NavLink>

          <NavLink to="/admin/attendance" className="nav-link">
            <FaCalendarCheck className="icon" />
            <span className="link-text">Attendance</span>
          </NavLink>

          <NavLink to="/admin/reports" className="nav-link">
            <FaFileAlt className="icon" />
            <span className="link-text">Reports</span>
          </NavLink>

          <NavLink to="/admin/settings" className="nav-link">
            <FaCog className="icon" />
            <span className="link-text">Settings</span>
          </NavLink>
        </nav>

        {/* Logout at bottom */}
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
          <h2>Overview</h2>

          <div className="stats-grid">
            {stats.map((item, index) => (
              <div key={index} className="stat-card">
                <p className="card-title">{item.title}</p>
                <h1 className="card-value">{item.value}</h1>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
