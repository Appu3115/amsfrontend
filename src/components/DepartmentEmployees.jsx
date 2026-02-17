import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/DepartmentEmployees.css";
import EmployeeProfileModal from "./EmployeeProfileModal";

const TABS = {
  ALL: "ALL",
  PROBATION: "PROBATION",
  CONFIRMED: "CONFIRMED",
};

const DepartmentEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const managerData = sessionStorage.getItem("user_manager");
  const manager = managerData ? JSON.parse(managerData) : null;

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    applyFilter(activeTab);
  }, [employees, activeTab]);

  const loadEmployees = async () => {
    try {
      if (!manager?.employeeId) return;

      const res = await api.get("/user/employees", {
        headers: { employeeId: manager.employeeId },
      });

      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (tab) => {
    switch (tab) {
      case TABS.PROBATION:
        setFiltered(
          employees.filter((e) => e.status === "PROBATION")
        );
        break;
      case TABS.CONFIRMED:
        setFiltered(
          employees.filter((e) => e.status === "CONFIRMED")
        );
        break;
      default:
        setFiltered(employees);
    }
  };

  /* ===== REQUEST CONFIRMATION ===== */
  const requestConfirmation = async (employeeId) => {
    const ok = window.confirm(
      `Send confirmation request to admin for ${employeeId}?`
    );
    if (!ok) return;

    try {
      setActionLoading(employeeId);

      await api.put(
        `/user/${employeeId}/request-confirmation`,
        null,
        {
          params: {
            managerEmployeeId: manager.employeeId,
          },
        }
      );

      await loadEmployees();
    } catch (err) {
      alert(err.response?.data || "Failed to request confirmation");
    } finally {
      setActionLoading(null);
    }
  };

  /* ===== DELETE ===== */
  const deleteEmployee = async (employeeId) => {
    const ok = window.confirm(
      `Are you sure you want to delete employee ${employeeId}?`
    );
    if (!ok) return;

    try {
      setActionLoading(employeeId);

      await api.delete(`/user/delete/${employeeId}`);
      await loadEmployees();
    } catch (err) {
      alert(err.response?.data || "Failed to delete employee");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="table-loader">Loading employees...</div>;
  }

  return (
    <div className="dept-table-wrapper">
      <div className="dept-table-header">
        <h3>Department Employees</h3>
        <span className="count-pill">{filtered.length}</span>
      </div>

      {/* TABS */}
      <div className="emp-tabs">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            className={`emp-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Shift</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td>

                <td>
                  <span
                    className="emp-name-link"
                    onClick={() =>
                      setSelectedEmployeeId(emp.employeeId)
                    }
                  >
                    {emp.firstName} {emp.lastName}
                  </span>
                </td>

                <td>{emp.email}</td>
                <td>{emp.phone || "-"}</td>

                <td>
                  <span
                    className={`status-pill ${emp.status.toLowerCase()}`}
                  >
                    {emp.status.replace("_", " ")}
                  </span>
                </td>

                <td>
                  {emp.shift?.shiftName}
                  <div className="shift-time">
                    {formatTime12Hour(emp.shift?.startTime)} -{" "}
                    {formatTime12Hour(emp.shift?.endTime)}
                  </div>
                </td>

                <td className="action-cell">
                  {/* SHOW REQUEST ONLY IN PROBATION TAB */}
                  {activeTab === TABS.PROBATION && (
                    <button
                      className="request-btn"
                      disabled={actionLoading === emp.employeeId}
                      onClick={() =>
                        requestConfirmation(emp.employeeId)
                      }
                    >
                      {actionLoading === emp.employeeId
                        ? "Sending..."
                        : "Request"}
                    </button>
                  )}

                  {/* SHOW DELETE ONLY OUTSIDE PROBATION TAB */}
                  {activeTab !== TABS.PROBATION && (
                    <button
                      className="delete-btn"
                      disabled={actionLoading === emp.employeeId}
                      onClick={() => deleteEmployee(emp.employeeId)}
                    >
                      {actionLoading === emp.employeeId
                        ? "Processing..."
                        : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEmployeeId && (
        <EmployeeProfileModal
          employeeId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
        />
      )}
    </div>
  );
};

const formatTime12Hour = (time) => {
  if (!time) return "";
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

export default DepartmentEmployees;
