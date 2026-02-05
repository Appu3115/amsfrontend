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

import "../styles/EmployeeReports.css";

const COLORS = ["#22c55e", "#ef4444", "#f97316", "#f59e0b"];

const EmployeeReports = () => {
  const user = getUser();
  const employeeId = user?.employeeId;

  const [weeklyAtt, setWeeklyAtt] = useState(null);
  const [monthlyAtt, setMonthlyAtt] = useState(null);
  const [weeklyLeave, setWeeklyLeave] = useState(null);
  const [monthlyLeave, setMonthlyLeave] = useState(null);
  const [weeklyLate, setWeeklyLate] = useState(null);
  const [monthlyLate, setMonthlyLate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const month = new Date().toISOString().slice(0, 7);

      const [
        wA, mA,
        wL, mL,
        wLate, mLate,
      ] = await Promise.all([
        api.get("api/reports/employee/attendance/weekly", { params: { employeeId } }),
        api.get("api/reports/employee/attendance/monthly", { params: { employeeId, month } }),
        api.get("api/reports/employee/leaves/weekly", { params: { employeeId } }),
        api.get("api/reports/employee/leaves/monthly", { params: { employeeId, month } }),
        api.get("api/reports/employee/late/weekly", { params: { employeeId } }),
        api.get("api/reports/employee/late/monthly", { params: { employeeId, month } }),
      ]);

      setWeeklyAtt(wA.data);
      setMonthlyAtt(mA.data);
      setWeeklyLeave(wL.data);
      setMonthlyLeave(mL.data);
      setWeeklyLate(wLate.data);
      setMonthlyLate(mLate.data);

    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="report-loading">Loading reports…</div>;
  }

  /* ================= DATA MAPPERS ================= */

  // ✅ Attendance (percentage based)
  const attendancePie = (d) => {
    if (!d) return [];
    return [
      { name: "Present", value: d.presentPercentage || 0 },
      { name: "Absent", value: d.absentPercentage || 0 },
      { name: "Leave", value: d.leavePercentage || 0 },
      { name: "Late", value: d.latePercentage || 0 },
    ];
  };

  // ✅ Leave counts
  const leaveBar = (d) => {
    if (!d) return [];
    return [
      { name: "Approved", value: d.approvedCount || 0 },
      { name: "Rejected", value: d.rejectedCount || 0 },
      { name: "Pending", value: d.pendingCount || 0 },
    ];
  };

  // ✅ Late chart (SAFE VERSION – NEVER FAILS)
  const latePie = (d) => {
    if (!d || d.lateDays == null) {
      return [{ name: "No Data", value: 1 }];
    }

    if (d.lateDays === 0) {
      return [{ name: "No Late Days 🎉", value: 1 }];
    }

    return [{ name: "Late Days", value: d.lateDays }];
  };

  return (
    <div className="reports-dashboard">
      <h2 className="reports-title">📊 My Reports</h2>

      {/* ================= ATTENDANCE ================= */}
      <section>
        <h3>Attendance (%)</h3>
        <div className="report-grid">
          <ReportCard title="This Week">
            <PieView data={attendancePie(weeklyAtt)} unit="%" />
          </ReportCard>
          <ReportCard title="This Month">
            <PieView data={attendancePie(monthlyAtt)} unit="%" />
          </ReportCard>
        </div>
      </section>

      {/* ================= LEAVES ================= */}
      <section>
        <h3>Leaves</h3>
        <div className="report-grid">
          <ReportCard title="This Week">
            <BarView data={leaveBar(weeklyLeave)} />
          </ReportCard>
          <ReportCard title="This Month">
            <BarView data={leaveBar(monthlyLeave)} />
          </ReportCard>
        </div>
      </section>

      {/* ================= LATE ================= */}
      <section>
        <h3>Late</h3>
        <div className="report-grid">
          <ReportCard title="This Week">
            <PieView data={latePie(weeklyLate)} unit="days" />
          </ReportCard>
          <ReportCard title="This Month">
            <PieView data={latePie(monthlyLate)} unit="days" />
          </ReportCard>
        </div>
      </section>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const ReportCard = ({ title, children }) => (
  <div className="report-card">
    <h4>{title}</h4>
    {children}
  </div>
);

const PieView = ({ data, unit }) => {
  if (!data || data.length === 0) {
    return <div className="no-chart-data">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `${v} ${unit}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const BarView = ({ data }) => (
  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="value" fill="#f97316" />
    </BarChart>
  </ResponsiveContainer>
);

export default EmployeeReports;
