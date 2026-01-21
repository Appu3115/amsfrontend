import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/HolidayAdmin.css"; // reuse same styles

const TABS = ["ALL", "NATIONAL", "FESTIVE", "RESTRICTED"];

const MONTHS = [
  "All Months",
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HolidayList = ({ title = "Holidays" }) => {
  const currentYear = new Date().getFullYear();

  const [holidays, setHolidays] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0);
  const [week, setWeek] = useState(0);

  /* ================= LOAD HOLIDAYS ================= */
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const res = await api.get(`/admin/holidays/${year}`);
        setHolidays(res.data);
      } catch (err) {
        console.error("Failed to load holidays", err);
      }
    };
    loadHolidays();
  }, [year]);

  /* ================= YEAR LIST ================= */
  const availableYears = [
    ...new Set(holidays.map(h => new Date(h.date).getFullYear()))
  ].sort((a, b) => b - a);

  /* ================= HELPERS ================= */
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  };

  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + firstDay) / 7);
  };

  /* ================= FILTER ================= */
  const filtered = holidays.filter((h) => {
    const d = new Date(h.date);

    if (activeTab !== "ALL" && h.type !== activeTab) return false;
    if (d.getFullYear() !== year) return false;
    if (month !== 0 && d.getMonth() + 1 !== month) return false;
    if (week !== 0 && getWeekOfMonth(d) !== week) return false;

    return true;
  });

  return (
    <div className="holiday-admin">
      {/* HEADER */}
      <div className="holiday-header">
        <div>
          <h2>{title}</h2>
          <p>Company holiday calendar</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filters">
        <select value={year} onChange={(e) => setYear(+e.target.value)}>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(+e.target.value)}>
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select value={week} onChange={(e) => setWeek(+e.target.value)}>
          <option value={0}>All Weeks</option>
          {[1, 2, 3, 4, 5].map((w) => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
      </div>

      {/* TABS */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={activeTab === t ? "active" : ""}
            onClick={() => setActiveTab(t)}
          >
            {t === "ALL" ? "All Holidays" : t}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty">No holidays found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Holiday</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={i}>
                  <td>{formatDate(h.date)}</td>
                  <td>{h.day}</td>
                  <td>{h.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HolidayList;
