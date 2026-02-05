import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import "../styles/DepartmentAttendance.css";

/* ================= CONSTANTS ================= */

const STATUSES = {
  ALL: "ALL",
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  PERMISSION: "PERMISSION",
  WORK_FROM_HOME: "WORK_FROM_HOME",
};

const DATE_FILTERS = {
  TODAY: "TODAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
  YEAR: "YEAR",
  CUSTOM: "CUSTOM",
};

const DepartmentAttendance = () => {
  const user = getUser();
  const employeeId = user?.employeeId;

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [activeStatus, setActiveStatus] = useState(STATUSES.ALL);
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.TODAY);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [empSearch, setEmpSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ================= */

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    applyAllFilters();
  }, [data, activeStatus, dateFilter, fromDate, toDate, empSearch]);

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

  /* ================= CORE LOGIC ================= */

  const getTodayWithDefaultAbsent = () => {
    const todayStr = new Date().toISOString().split("T")[0];

    const todayAttendance = data.filter(
      (d) => d.attendanceDate === todayStr
    );

    // ✅ If today has attendance → use it
    if (todayAttendance.length > 0) {
      return todayAttendance;
    }

    // ❗ No attendance today → derive employees from history
    const uniqueEmployees = new Map();

    data.forEach((d) => {
      uniqueEmployees.set(d.employee.employeeId, d.employee);
    });

    // If no historical data at all
    if (uniqueEmployees.size === 0) return [];

    // Create default ABSENT rows
    return Array.from(uniqueEmployees.values()).map((emp) => ({
      attendanceDate: todayStr,
      employee: emp,
      status: "ABSENT",
      login: null,
      logout: null,
      lateMinutes: null,
      overtimeMinutes: null,
      shift: emp.shift || null,
    }));
  };

  /* ================= FILTER ================= */

  const applyAllFilters = () => {
    let result = [];

    const today = new Date();

    /* DATE FILTER */
    if (dateFilter === DATE_FILTERS.TODAY) {
      result = getTodayWithDefaultAbsent();
    } else {
      result = data.filter((r) => {
        const attDate = new Date(r.attendanceDate);

        switch (dateFilter) {
          case DATE_FILTERS.WEEK: {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            return attDate >= start && attDate <= today;
          }

          case DATE_FILTERS.MONTH:
            return (
              attDate.getMonth() === today.getMonth() &&
              attDate.getFullYear() === today.getFullYear()
            );

          case DATE_FILTERS.YEAR:
            return attDate.getFullYear() === today.getFullYear();

          case DATE_FILTERS.CUSTOM:
            if (!fromDate || !toDate) return true;
            return (
              attDate >= new Date(fromDate) &&
              attDate <= new Date(toDate)
            );

          default:
            return true;
        }
      });
    }

    /* STATUS FILTER */
    if (activeStatus !== STATUSES.ALL) {
      if (activeStatus === STATUSES.PRESENT) {
        result = result.filter(
          (r) =>
            r.status === "PRESENT" ||
            r.status === "IN_PROGRESS"
        );
      } else {
        result = result.filter((r) => r.status === activeStatus);
      }
    }

    /* EMPLOYEE FILTER */
    if (empSearch.trim()) {
      const q = empSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.employee.employeeId.toLowerCase().includes(q) ||
          r.employee.name.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  /* ================= COUNT ================= */

  const getCount = (status) => {
    const base =
      dateFilter === DATE_FILTERS.TODAY
        ? getTodayWithDefaultAbsent()
        : data;

    if (status === STATUSES.ALL) return base.length;

    if (status === STATUSES.PRESENT) {
      return base.filter(
        (d) =>
          d.status === "PRESENT" ||
          d.status === "IN_PROGRESS"
      ).length;
    }

    return base.filter((d) => d.status === status).length;
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="att-loader">Loading attendance…</div>;
  }

  if (error) {
    return <div className="att-error">{error}</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="att-container">
      <div className="att-header">
        <div>
          <h2>Department Attendance</h2>
          <p>Today’s attendance shown by default</p>
        </div>
        <span className="att-count">{filtered.length}</span>
      </div>

      {/* FILTER BAR */}
      <div className="att-filters">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="TODAY">Today</option>
          <option value="WEEK">This Week</option>
          <option value="MONTH">This Month</option>
          <option value="YEAR">This Year</option>
          <option value="CUSTOM">Custom Range</option>
        </select>

        {dateFilter === DATE_FILTERS.CUSTOM && (
          <>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}

        <input
          type="text"
          placeholder="Search Employee ID / Name"
          value={empSearch}
          onChange={(e) => setEmpSearch(e.target.value)}
        />
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
            {status.replaceAll("_", " ")} ({getCount(status)})
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
                  No records found
                </td>
              </tr>
            ) : (
              filtered.map((att, idx) => (
                <tr key={idx}>
                  <td>{att.employee.employeeId}</td>
                  <td>{att.employee.name}</td>
                  <td>{att.attendanceDate}</td>
                  <td>{formatTime(att.login)}</td>
                  <td>{formatTime(att.logout)}</td>
                  <td>
                    <span className={`status ${att.status.toLowerCase()}`}>
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

const formatTime = (time) =>
  time
    ? new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatMinutes = (min) =>
  min != null ? `${min} min` : "--";

export default DepartmentAttendance;
