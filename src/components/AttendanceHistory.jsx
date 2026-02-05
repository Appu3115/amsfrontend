import { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "./StatusBadge";
import "../styles/AttendanceHistory.css";
import { getUser } from "../utils/auth";
import LeaveRequest from "./LeaveRequest";

const AttendanceHistory = () => {
  const user = getUser();
  const employeeId = user?.employeeId?.toUpperCase();

  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLeave, setShowLeave] = useState(false);

  /* ===== FILTER STATE ===== */
  const [dateFilter, setDateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (employeeId) fetchAttendance();
  }, [employeeId]);

  useEffect(() => {
    applyFilters();
  }, [attendance, dateFilter, statusFilter]);

  /* ---------- Helpers ---------- */

  const formatDateOnly = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  const formatTime12H = (dateTime) =>
    dateTime
      ? new Date(dateTime).toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "-";

  /* ---------- FETCH ---------- */
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/attendance/employee/${employeeId}`
      );

      setAttendance(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
      setAttendance([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- FILTER LOGIC ---------- */
  const applyFilters = () => {
    let result = [...attendance];
    const today = new Date();

    /* DATE FILTER */
    if (dateFilter === "TODAY") {
      result = result.filter(
        (a) =>
          new Date(a.attendanceDate).toDateString() ===
          today.toDateString()
      );
    }

    if (dateFilter === "MONTH") {
      result = result.filter((a) => {
        const d = new Date(a.attendanceDate);
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });
    }

    if (dateFilter === "YEAR") {
      result = result.filter(
        (a) =>
          new Date(a.attendanceDate).getFullYear() ===
          today.getFullYear()
      );
    }

    /* STATUS FILTER */
    if (statusFilter !== "ALL") {
      result = result.filter(
        (a) => a.dailyStatus === statusFilter
      );
    }

    setFiltered(result);
  };

  if (loading)
    return (
      <p className="loading">
        Loading attendance history...
      </p>
    );

  if (error)
    return <p className="error">{error}</p>;

  return (
    <>
      <div className="attendance-container">
        {/* ===== Header ===== */}
        <div className="attendance-header">
          <div>
            <h2>Attendance History</h2>
            <p>
              Track your daily attendance & work summary
            </p>
          </div>

          <button
            className="apply-leave-btn"
            onClick={() => setShowLeave(true)}
          >
            + Apply Leave
          </button>
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="attendance-filters">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="MONTH">This Month</option>
            <option value="YEAR">This Year</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LEAVE">Leave</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="PERMISSION">Permission</option>
            <option value="WORK_FROM_HOME">
              Work From Home
            </option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">
            No attendance records found
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
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
                {filtered.map((a, index) => (
                  <tr
                    key={index}
                    className={a.dailyStatus?.toLowerCase()}
                  >
                    <td>
                      {formatDateOnly(
                        a.attendanceDate
                      )}
                    </td>
                    <td>
                      {formatTime12H(a.login)}
                    </td>
                    <td>
                      {formatTime12H(a.logout)}
                    </td>
                    <td>
                      <StatusBadge
                        status={a.dailyStatus}
                      />
                    </td>
                    <td>
                      {formatDuration(
                        a.totalWorkMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.totalBreakMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.permissionMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.lateMinutes
                      )}
                    </td>
                    <td>
                      {formatDuration(
                        a.overtimeMinutes
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Leave Request Popup ===== */}
      {showLeave && (
        <LeaveRequest
          onClose={() => {
            setShowLeave(false);
            fetchAttendance();
          }}
        />
      )}
    </>
  );
};

/* ---------- Duration formatter ---------- */
const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined)
    return "-";
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0
    ? `${hrs}h ${mins}m`
    : `${hrs}h`;
};

export default AttendanceHistory;
