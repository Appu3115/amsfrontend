import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/HolidayAdmin.css";

const emptyRow = { title: "", date: "", type: "NATIONAL" };
const TABS = ["ALL", "NATIONAL", "FESTIVE", "RESTRICTED"];

/* ➕ MONTH CONSTANT */
const MONTHS = [
  "All Months",
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HolidayAdmin = () => {
  const currentYear = new Date().getFullYear();

  const [holidays, setHolidays] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");

  /* ➕ FILTER STATES */
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(0); // 0 = all
  const [week, setWeek] = useState(0); // 0 = all

  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [message, setMessage] = useState("");

  const [single, setSingle] = useState(emptyRow);
  const [bulkRows, setBulkRows] = useState([{ ...emptyRow }]);
const availableYears = [
  ...new Set(holidays.map(h => new Date(h.date).getFullYear()))
].sort((a, b) => b - a);

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

  /* ================= SUCCESS HANDLER ================= */
  const onSuccess = (msg) => {
    setMessage(msg);
    setShowAdd(false);
    setShowBulk(false);
    setSingle(emptyRow);
    setBulkRows([{ ...emptyRow }]);

    const reload = async () => {
      const res = await api.get(`/admin/holidays/${year}`);
      setHolidays(res.data);
    };
    reload();

    setTimeout(() => setMessage(""), 3000);
  };

  /* ➕ DATE FORMATTER */
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  };

  /* ➕ WEEK OF MONTH */
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + firstDay) / 7);
  };

  /* ================= FILTER (ENHANCED, NOT REMOVED) ================= */
  const filtered = holidays.filter((h) => {
    const d = new Date(h.date);

    if (activeTab !== "ALL" && h.type !== activeTab) return false;
    if (d.getFullYear() !== year) return false;
    if (month !== 0 && d.getMonth() + 1 !== month) return false;
    if (week !== 0 && getWeekOfMonth(d) !== week) return false;

    return true;
  });

  /* ================= SINGLE ADD ================= */
  const submitSingle = async () => {
    const res = await api.post("/admin/holidays/add", single);
    onSuccess(res.data);
  };

  /* ================= BULK ADD ================= */
  const addRow = () => setBulkRows([...bulkRows, { ...emptyRow }]);

  const removeRow = (i) =>
    setBulkRows(bulkRows.filter((_, index) => index !== i));

  const updateRow = (i, field, value) => {
    const copy = [...bulkRows];
    copy[i][field] = value;
    setBulkRows(copy);
  };

  const submitBulk = async () => {
    const valid = bulkRows.filter((r) => r.title && r.date && r.type);
    if (!valid.length) return;
    const res = await api.post("/admin/holidays/addbulk", valid);
    onSuccess(res.data);
  };

  return (
    <div className="holiday-admin">
      {/* ================= HEADER ================= */}
      <div className="holiday-header">
        <div>
          <h2>Holiday Management</h2>
          <p>Manage company holidays by year</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={() => setShowAdd(true)}>
            + Add Holiday
          </button>
          <button onClick={() => setShowBulk(true)}>+ Bulk Add</button>
        </div>
      </div>

      {/* ================= MESSAGE ================= */}
      {message && <div className="message">{message}</div>}

      {/* ➕ FILTER BAR */}
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

      {/* ================= TABS ================= */}
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

      {/* ================= LIST ================= */}
      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty">No holidays found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday Name</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id}>
                  {/* ➕ FORMATTED DATE */}
                  <td>{formatDate(h.date)}</td>
                  <td>{h.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAdd && (
        <Modal title="Add Holiday" onClose={() => setShowAdd(false)}>
          <input
            placeholder="Holiday title"
            value={single.title}
            onChange={(e) =>
              setSingle({ ...single, title: e.target.value })
            }
          />
          <input
            type="date"
            value={single.date}
            onChange={(e) =>
              setSingle({ ...single, date: e.target.value })
            }
          />
          <select
            value={single.type}
            onChange={(e) =>
              setSingle({ ...single, type: e.target.value })
            }
          >
            <option value="NATIONAL">National</option>
            <option value="FESTIVE">Festive</option>
            <option value="RESTRICTED">Restricted</option>
          </select>

          <div className="modal-actions">
            <button className="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="primary" onClick={submitSingle}>
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ================= BULK MODAL ================= */}
      {showBulk && (
        <Modal title="Bulk Add Holidays" large onClose={() => setShowBulk(false)}>
          {bulkRows.map((row, i) => (
            <div className="row" key={i}>
              <input
                placeholder="Title"
                value={row.title}
                onChange={(e) => updateRow(i, "title", e.target.value)}
              />
              <input
                type="date"
                value={row.date}
                onChange={(e) => updateRow(i, "date", e.target.value)}
              />
              <select
                value={row.type}
                onChange={(e) => updateRow(i, "type", e.target.value)}
              >
                <option value="NATIONAL">National</option>
                <option value="FESTIVE">Festive</option>
                <option value="RESTRICTED">Restricted</option>
              </select>

              {bulkRows.length > 1 && (
                <button
                  className="danger"
                  onClick={() => removeRow(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <div className="modal-actions">
            <button onClick={addRow}>+ Add Row</button>
            <button className="primary" onClick={submitBulk}>
              Save All
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ================= MODAL ================= */
const Modal = ({ title, onClose, large, children }) => (
  <div className="modal-overlay">
    <div className={`modal ${large ? "large" : ""}`}>
      <button className="close" onClick={onClose}>✕</button>
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);

export default HolidayAdmin;
