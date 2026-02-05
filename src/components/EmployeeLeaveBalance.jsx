import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/EmployeeLeaveBalance.css";
import { getUser } from "../utils/auth";

const EmployeeLeaveBalance = () => {
  const user = getUser();
  const employeeId = user?.employeeId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employeeId) fetchLeaveBalance();
  }, [employeeId]);

  const fetchLeaveBalance = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/leave/balance/${employeeId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load leave balance");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="lb-loader">Loading leave balance…</div>;
  if (error) return <div className="lb-error">{error}</div>;
  if (!data) return null;

  const { totalLeaves, used, remaining, restrictedHoliday, employeeStatus } =
    data;

  return (
    <div className="leave-balance-container">
      {/* HEADER */}
      <div className="lb-header">
        <div>
          <h2>Leave Balance</h2>
          <p>Status: <b>{employeeStatus}</b></p>
        </div>
      </div>

      {/* LEAVE CARDS */}
      <div className="lb-grid">
        <LeaveCard
          title="Casual Leave"
          total={totalLeaves.casual}
          used={used.casualUsed}
          available={remaining.casual}
        />

        <LeaveCard
          title="Sick Leave"
          total={totalLeaves.sick}
          used={used.sickUsed}
          available={remaining.sick}
        />

        <LeaveCard
          title="Earned Leave"
          total={totalLeaves.earned}
          used={used.earnedUsed}
          available={remaining.earned}
        />
      </div>

      {/* RESTRICTED HOLIDAY */}
      <div className="restricted-card">
        <span>Restricted Holidays Used</span>
        <strong>
          {restrictedHoliday.used} / {restrictedHoliday.allowedPerYear}
        </strong>
      </div>
    </div>
  );
};

/* ================= LEAVE CARD ================= */

const LeaveCard = ({ title, total, used, available }) => {
  const percent =
    total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="leave-card">
      <h4>{title}</h4>

      <div className="leave-values">
        <span>Available: <b>{available}</b></span>
        <span>Used: <b>{used}</b></span>
        <span>Total: <b>{total}</b></span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      <small>{percent.toFixed(2)}% used</small>
    </div>
  );
};

export default EmployeeLeaveBalance;
