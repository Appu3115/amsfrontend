import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AdminAttendance.css";

const DATE_FILTERS = {
  TODAY: "TODAY",
  MONTH: "MONTH",
  YEAR: "YEAR",
  CUSTOM: "CUSTOM",
};

const STATUS_FILTERS = {
  ALL: "ALL",
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  PERMISSION: "PERMISSION",
  WORK_FROM_HOME: "WORK_FROM_HOME",
};

const AdminAttendance = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ===== FILTER STATE ===== */
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.TODAY);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL);
  const [empSearch, setEmpSearch] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, dateFilter, statusFilter, empSearch, fromDate, toDate]);

  /* ===== FETCH ===== */
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/all");
      setData(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Error fetching admin attendance", err);
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===== FILTER LOGIC ===== */
  const applyFilters = () => {
    let result = [...data];
    const today = new Date();

    /* DATE FILTER */
    if (dateFilter === DATE_FILTERS.TODAY) {
      result = result.filter(
        (r) =>
          new Date(r.attendanceDate).toDateString() ===
          today.toDateString()
      );
    }

    if (dateFilter === DATE_FILTERS.MONTH) {
      result = result.filter((r) => {
        const d = new Date(r.attendanceDate);
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });
    }

    if (dateFilter === DATE_FILTERS.YEAR) {
      result = result.filter(
        (r) =>
          new Date(r.attendanceDate).getFullYear() ===
          today.getFullYear()
      );
    }

    if (dateFilter === DATE_FILTERS.CUSTOM) {
      if (fromDate && toDate) {
        result = result.filter((r) => {
          const d = new Date(r.attendanceDate);
          return (
            d >= new Date(fromDate) &&
            d <= new Date(toDate)
          );
        });
      }
    }

    /* STATUS FILTER */
if (statusFilter !== STATUS_FILTERS.ALL) {
  if (statusFilter === STATUS_FILTERS.PRESENT) {
    result = result.filter(
      (r) =>
        r.dailyStatus === "PRESENT" ||
        r.dailyStatus === "IN_PROGRESS"
    );
  } else {
    result = result.filter(
      (r) => r.dailyStatus === statusFilter
    );
  }
}


    /* EMPLOYEE FILTER */
    if (empSearch.trim()) {
      const q = empSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeId?.toLowerCase().includes(q) ||
          r.employeeName?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  if (loading) {
    return <div className="loader">Loading attendance...</div>;
  }

  return (
    <div className="admin-attendance-container">
      <div className="header">
        <div>
          <h2>Attendance Overview</h2>
          <p>All employees daily attendance & work summary</p>
        </div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="admin-filters">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="TODAY">Today</option>
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

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="PERMISSION">Permission</option>
          <option value="WORK_FROM_HOME">
            Work From Home
          </option>
        </select>

        <input
          type="text"
          placeholder="Search Employee ID / Name"
          value={empSearch}
          onChange={(e) => setEmpSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty">No attendance records found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Status</th>
                <th>Work</th>
                <th>Break</th>
                <th>Permission</th>
                <th>Late</th>
                <th>Overtime</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, index) => (
                <tr
                  key={index}
                  className={row.dailyStatus?.toLowerCase()}
                >
                  <td>
                    <div className="emp-info">
                      <span className="emp-name">
                        {row.employeeName}
                      </span>
                      <span className="emp-id">
                        {row.employeeId}
                      </span>
                    </div>
                  </td>

                  <td>{formatDateOnly(row.attendanceDate)}</td>
                  <td>{formatTime(row.login)}</td>
                  <td>{formatTime(row.logout)}</td>

                  <td>
                    <span
                      className={`status ${row.dailyStatus?.toLowerCase()}`}
                    >
                      {row.dailyStatus}
                    </span>
                  </td>

                  <td>{formatDuration(row.totalWorkMinutes)}</td>
                  <td>{formatDuration(row.totalBreakMinutes)}</td>
                  <td>{formatDuration(row.permissionMinutes)}</td>
                  <td>{formatDuration(row.lateMinutes)}</td>
                  <td>{formatDuration(row.overtimeMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const formatTime = (dateTime) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnly = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export default AdminAttendance;
