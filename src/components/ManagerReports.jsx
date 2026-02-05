import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUser } from "../utils/auth";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "../styles/ManagerReports.css";

/* ================= SEMANTIC COLORS ================= */
const ATTENDANCE_COLORS = {
  Present: "#22c55e", // Green
  Absent: "#ef4444",  // Red
  Leave: "#f97316",   // Orange
  Late: "#eab308",    // Yellow
};

const LEAVE_COLORS = {
  Approved: "#22c55e",
  Rejected: "#ef4444",
  Pending: "#f97316",
};

const LATE_COLORS = {
  "Late Days": "#dc2626",
  "On Time Days": "#22c55e",
};

const DEFAULT_COLORS = ["#f97316", "#3b82f6", "#a855f7"];

const MODES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  CUSTOM: "CUSTOM",
};

const emptySet = {
  attendance: null,
  leaves: null,
  late: null,
  overtime: null,
  wfh: null,
};

const today = new Date().toISOString().slice(0, 10);
const thisMonth = new Date().toISOString().slice(0, 7);

const ManagerReports = () => {
  const user = getUser();
  const managerEmployeeId = user?.employeeId;

  const [mode, setMode] = useState(MODES.WEEKLY);
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  const [data, setData] = useState({ ...emptySet });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [mode, date, month, start, end]);

  const loadReports = async () => {
    try {
      setLoading(true);

      let params = { managerEmployeeId };
      let suffix = "";

      if (mode === MODES.DAILY) {
        suffix = "daily";
        params.date = date;
      }

      if (mode === MODES.WEEKLY) {
        suffix = "weekly";
        params.start = start;
        params.end = end;
      }

      if (mode === MODES.MONTHLY) {
        suffix = "monthly";
        params.month = month;
      }

      if (mode === MODES.CUSTOM) {
        suffix = "weekly";
        params.start = start;
        params.end = end;
      }

      const [att, leave, lateRes, ot, wfhRes] = await Promise.all([
        api.get(`/api/reports/manager/attendance/${suffix}`, { params }),
        api.get(`/api/reports/manager/leaves/${suffix}`, { params }),
        api.get(`/api/reports/manager/late/${suffix}`, { params }),
        api.get(`/api/reports/manager/overtime/${suffix}`, { params }),
        api.get(`/api/reports/manager/wfh/${suffix}`, { params }),
      ]);

      setData({
        attendance: att.data,
        leaves: leave.data,
        late: lateRes.data,
        overtime: ot.data,
        wfh: wfhRes.data,
      });
    } catch (err) {
      console.error("Manager report load failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DATA MAPPERS ================= */

  const attendancePie = (d) =>
    !d
      ? []
      : [
          { name: "Present", value: d.presentPercentage || 0 },
          { name: "Absent", value: d.absentPercentage || 0 },
          { name: "Leave", value: d.leavePercentage || 0 },
          { name: "Late", value: d.latePercentage || 0 },
        ];

  const leaveBar = (d) =>
    !d
      ? []
      : [
          { name: "Approved", value: d.approvedCount || 0 },
          { name: "Rejected", value: d.rejectedCount || 0 },
          { name: "Pending", value: d.pendingCount || 0 },
        ];

  const latePie = (d) => {
    if (!d || d.lateDays == null || d.totalDays == null) {
      return [{ name: "No Data", value: 1 }];
    }

    const late = d.lateDays;
    const onTime = Math.max(d.totalDays - late, 0);

    return [
      { name: "Late Days", value: late },
      { name: "On Time Days", value: onTime },
    ];
  };

  const overtimeBar = (d) =>
    !d || !d.totalHours
      ? [{ name: "No OT", value: 1 }]
      : [{ name: "OT Hours", value: d.totalHours }];

  const wfhBar = (d) =>
    !d || !d.wfhDays
      ? [{ name: "No WFH", value: 1 }]
      : [{ name: "WFH Days", value: d.wfhDays }];

  return (
    <div className="reports-dashboard">
      <h2 className="reports-title">📊 Department Reports</h2>

      {/* ================= FILTER BAR ================= */}
      <div className="report-filters advanced">
        <div className="tabs">
          {Object.values(MODES).map((m) => (
            <button
              key={m}
              className={mode === m ? "active" : ""}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === MODES.DAILY && (
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}

        {mode === MODES.MONTHLY && (
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        )}

        {(mode === MODES.WEEKLY || mode === MODES.CUSTOM) && (
          <>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </>
        )}
      </div>

      {loading && <div className="report-loading">Loading…</div>}

      {/* ================= GRID ================= */}
      <div className="report-grid">
        <Card title="Attendance">
          <PieView data={attendancePie(data.attendance)} unit="%" colorMap={ATTENDANCE_COLORS} />
        </Card>

        <Card title="Leaves">
          <BarView data={leaveBar(data.leaves)} colorMap={LEAVE_COLORS} />
        </Card>

        <Card title="Late">
          <PieView data={latePie(data.late)} unit="days" colorMap={LATE_COLORS} />
        </Card>

        <Card title="Overtime">
          <BarView data={overtimeBar(data.overtime)} />
        </Card>

        <Card title="WFH">
          <BarView data={wfhBar(data.wfh)} />
        </Card>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const Card = ({ title, children }) => (
  <div className="report-card">
    <h4>{title}</h4>
    {children}
  </div>
);

const PieView = ({ data, unit, colorMap }) => (
  <ResponsiveContainer width="100%" height={180}>
    <PieChart>
      <Pie data={data} dataKey="value" innerRadius={45} outerRadius={70}>
        {data.map((entry, i) => (
          <Cell
            key={i}
            fill={colorMap?.[entry.name] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip formatter={(v) => `${v} ${unit}`} />
    </PieChart>
  </ResponsiveContainer>
);

const BarView = ({ data, colorMap }) => (
  <ResponsiveContainer width="100%" height={180}>
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="value">
        {data.map((entry, i) => (
          <Cell
            key={i}
            fill={colorMap?.[entry.name] || "#f97316"}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default ManagerReports;
