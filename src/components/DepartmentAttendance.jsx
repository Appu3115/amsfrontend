import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "../styles/DepartmentAttendance.css";

/* ❌ REMOVED IN_PROGRESS TAB */
const STATUSES = {
  ALL: "ALL",
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  PERMISSION: "PERMISSION",
  WORK_FROM_HOME: "WORK_FROM_HOME",
};

const DepartmentAttendance = () => {
  const user = getUser(); // manager
  const employeeId = user?.employeeId;

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeStatus, setActiveStatus] = useState(STATUSES.ALL);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    applyFilter(activeStatus);
  }, [data, activeStatus]);

  const loadAttendance = async () => {
    try {
      const res = await api.get("/attendance/department", {
        headers: { employeeId },
      });
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const applyFilter = (status) => {
    if (status === STATUSES.ALL) {
      setFiltered(data);
      return;
    }

    if (status === STATUSES.PRESENT) {
      // ✅ PRESENT tab includes IN_PROGRESS
      setFiltered(
        data.filter(
          (d) =>
            d.status === "PRESENT" ||
            d.status === "IN_PROGRESS"
        )
      );
      return;
    }

    setFiltered(data.filter((d) => d.status === status));
  };

  /* ================= COUNT HELPERS ================= */
  const getCount = (status) => {
    if (status === STATUSES.ALL) return data.length;

    if (status === STATUSES.PRESENT) {
      return data.filter(
        (d) =>
          d.status === "PRESENT" ||
          d.status === "IN_PROGRESS"
      ).length;
    }

    return data.filter((d) => d.status === status).length;
  };

  if (loading) {
    return (
      <div className="att-loader">
        Loading department attendance…
      </div>
    );
  }

  if (error) {
    return <div className="att-error">{error}</div>;
  }

  return (
    <div className="att-container">
      {/* HEADER */}
      <div className="att-header">
        <div>
          <h2>Department Attendance</h2>
          <p>View attendance of your department employees</p>
        </div>

        <span className="att-count">
          {filtered.length}
        </span>
      </div>

      {/* STATUS TABS */}
      <div className="att-tabs">
        {Object.values(STATUSES).map((status) => (
          <button
            key={status}
            className={`att-tab ${
              activeStatus === status ? "active" : ""
            }`}
            onClick={() => setActiveStatus(status)}
          >
            {status.replaceAll("_", " ")} (
            {getCount(status)})
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="att-card">
        <table className="att-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Status</th>
              <th>Late</th>
              <th>Overtime</th>
              <th>Shift</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No attendance records found
                </td>
              </tr>
            ) : (
              filtered.map((att, idx) => (
                <tr
                  key={`${att.employee.employeeId}-${att.attendanceDate}-${idx}`}
                >
                  <td>{att.employee.employeeId}</td>
                  <td>{att.employee.name}</td>
                  <td>{att.attendanceDate}</td>
                  <td>{formatTime(att.login)}</td>
                  <td>{formatTime(att.logout)}</td>

                  {/* ✅ STATUS SHOWN AS-IS */}
                  <td>
                    <span
                      className={`status ${att.status.toLowerCase()}`}
                    >
                      {att.status}
                    </span>
                  </td>

                  <td>{formatMinutes(att.lateMinutes)}</td>
                  <td>{formatMinutes(att.overtimeMinutes)}</td>
                  <td>{att.shift?.shiftName || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const formatTime = (time) => {
  if (!time) return "--";
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMinutes = (min) =>
  min != null ? `${min} min` : "--";

export default DepartmentAttendance;
