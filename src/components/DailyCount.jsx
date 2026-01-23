import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/DailyCount.css";

const STATUSES = {
  ALL: "ALL",
  PRESENT: "PRESENT",
  HALF_DAY: "HALF_DAY",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE",
  LATE: "LATE",
};

const DailyCount = () => {
  const [summary, setSummary] = useState({});
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [activeCard, setActiveCard] = useState(STATUSES.ALL);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [date]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/admin/daily", {
        params: { fromDate: date },
      });

      const recordsData = res.data.records || [];
      const rawSummary = res.data.summary || {};

      // ✅ Treat IN_PROGRESS as PRESENT
      const presentCount = recordsData.filter(
        r => r.status === "PRESENT" || r.status === "IN_PROGRESS"
      ).length;

      setSummary({
        ...rawSummary,
        present: presentCount,
      });

      setRecords(recordsData);
      setFiltered(recordsData);
      setActiveCard(STATUSES.ALL);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const handleCardClick = (type) => {
    setActiveCard(type);

    switch (type) {
      case STATUSES.ALL:
        setFiltered(records);
        break;

      case STATUSES.PRESENT:
        setFiltered(
          records.filter(
            r => r.status === "PRESENT" || r.status === "IN_PROGRESS"
          )
        );
        break;

      case STATUSES.HALF_DAY:
        setFiltered(records.filter(r => r.status === "HALF_DAY"));
        break;

      case STATUSES.ABSENT:
        setFiltered(records.filter(r => r.status === "ABSENT"));
        break;

      case STATUSES.LEAVE:
        setFiltered(records.filter(r => r.status === "LEAVE"));
        break;

      case STATUSES.LATE:
        setFiltered(
          records.filter(
            r =>
              (r.status === "PRESENT" ||
                r.status === "HALF_DAY" ||
                r.status === "IN_PROGRESS") &&
              r.lateMinutes > 0
          )
        );
        break;

      default:
        setFiltered(records);
    }
  };

  if (loading) return <p className="dc-loading">Loading dashboard…</p>;

  return (
    <div className="dailycount">
      {/* ===== HEADER ===== */}
      <div className="dc-header">
        <h2>Overview</h2>

        <div className="dc-date">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="dc-cards">
        <StatCard
          title="Total Employees"
          value={summary.totalEmployees}
          active={activeCard === STATUSES.ALL}
          onClick={() => handleCardClick(STATUSES.ALL)}
        />

        <StatCard
          title="Present Today"
          value={summary.present}
          active={activeCard === STATUSES.PRESENT}
          onClick={() => handleCardClick(STATUSES.PRESENT)}
        />

        <StatCard
          title="Absent Today"
          value={summary.absent}
          active={activeCard === STATUSES.ABSENT}
          onClick={() => handleCardClick(STATUSES.ABSENT)}
        />

        <StatCard
          title="Half Day"
          value={summary.halfDay}
          active={activeCard === STATUSES.HALF_DAY}
          onClick={() => handleCardClick(STATUSES.HALF_DAY)}
        />

        <StatCard
          title="On Leave"
          value={summary.onLeave}
          active={activeCard === STATUSES.LEAVE}
          onClick={() => handleCardClick(STATUSES.LEAVE)}
        />

        <StatCard
          title="Late Check-ins"
          value={summary.lateCheckins}
          active={activeCard === STATUSES.LATE}
          onClick={() => handleCardClick(STATUSES.LATE)}
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="dc-table-card">
        <h3>{activeCard} Employees</h3>

        {filtered.length === 0 ? (
          <p className="dc-empty">No records available</p>
        ) : (
          <table className="dc-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Login</th>
                <th>Logout</th>
                <th>Status</th>
                <th>Late</th>
                <th>Work</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.employeeId}</td>
                  <td>{r.employeeName}</td>
                  <td>{formatDateTime(r.loginTime)}</td>
                  <td>{formatDateTime(r.logoutTime)}</td>
                  <td>
                    <span className={`dc-badge ${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{formatMinutes(r.lateMinutes)}</td>
                  <td>{formatMinutes(r.totalWorkMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const StatCard = ({ title, value, active, onClick }) => (
  <div className={`dc-card ${active ? "active" : ""}`} onClick={onClick}>
    <p>{title}</p>
    <h2>{value ?? 0}</h2>
  </div>
);

const formatDateTime = (dateTime) => {
  if (!dateTime) return "-";

  const date = new Date(dateTime);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMinutes = (minutes) => {
  if (!minutes || minutes === 0) return "0m";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;

  return `${hrs}h ${mins}m`;
};

export default DailyCount;
