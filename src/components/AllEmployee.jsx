import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllEmployee.css";
import { getUser } from "../utils/auth";
import EmployeeProfileModal from "./EmployeeProfileModal";

const AllEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Tabs */
  const [activeTab, setActiveTab] = useState("EMPLOYEE");

  /* Logged-in user */
  const loggedUser = getUser();
  const loggedInEmployeeId = loggedUser?.employeeId;
  const loggedInRole = loggedUser?.role;

  /* Shift modal */
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [shiftMsg, setShiftMsg] = useState("");

  /* Profile modal */
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/getAllEmployees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get("/shift/getAllShift");
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTERS ================= */

  const managers = employees.filter((emp) => emp.role === "MANAGER");
  const employeeList = employees.filter((emp) => emp.role === "EMPLOYEE");

  const currentData =
    activeTab === "MANAGER" ? managers : employeeList;

  /* ================= UTILS ================= */

  const formatTime12Hour = (time) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  /* ================= SHIFT MODAL ================= */

  const openShiftModal = (emp) => {
    setSelectedEmp(emp);
    setSelectedShiftId("");
    setStartDate("");
    setShiftMsg("");
    setShowShiftModal(true);
  };

  const closeShiftModal = () => {
    setShowShiftModal(false);
    setSelectedEmp(null);
  };

  const updateShift = async () => {
    if (!selectedShiftId || !startDate) {
      setShiftMsg("Shift and start date are required");
      return;
    }

    try {
      await api.put(
        "/shift/update-shift",
        {
          employeeId: selectedEmp.employeeId,
          shiftId: selectedShiftId,
          startDate,
        },
        {
          params: { employeeId: loggedInEmployeeId },
        }
      );

      setShiftMsg("Shift updated successfully");
      fetchEmployees();
      setTimeout(closeShiftModal, 800);
    } catch (err) {
      setShiftMsg(err.response?.data || "Shift update failed");
    }
  };

  /* ================= RENDER ================= */

  if (loading) return <p className="loading-text">Loading employees...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const renderTable = (data) => (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Department</th>
            <th>Shift</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((emp) => (
            <tr key={emp.employeeId}>
              <td>{emp.employeeId}</td>

              {/* ✅ CLICK NAME TO OPEN PROFILE */}
              <td>
                <span
                  className="emp-name-link"
                  onClick={() => {
                    if (loggedInRole === "ADMIN") {
                      setSelectedEmployeeId(emp.employeeId);
                    }
                  }}
                >
                  {emp.firstName} {emp.lastName}
                </span>
              </td>

              <td>{emp.email}</td>
              <td>{emp.phone}</td>

              <td>
                <span className={`role-badge ${emp.role.toLowerCase()}`}>
                  {emp.role}
                </span>
              </td>

              <td>{emp.department?.deptName || "-"}</td>

              <td>
                {emp.shift
                  ? `${emp.shift.shiftName} (${formatTime12Hour(
                      emp.shift.startTime
                    )} - ${formatTime12Hour(emp.shift.endTime)})`
                  : "-"}
              </td>

              <td>
                {/* UPDATE SHIFT */}
                {emp.role === "EMPLOYEE" &&
                  (loggedInRole === "ADMIN" ||
                    loggedInRole === "MANAGER") && (
                    <button
                      className="shift-btn"
                      onClick={() => openShiftModal(emp)}
                    >
                      Update Shift
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-emp-container">
      <h2 className="page-title">Employee Management</h2>
      <p className="page-subtitle">View and manage managers & employees</p>

      {/* TABS */}
      <div className="emp-tabs">
        <button
          className={`tab-btn ${activeTab === "MANAGER" ? "active" : ""}`}
          onClick={() => setActiveTab("MANAGER")}
        >
          Managers ({managers.length})
        </button>

        <button
          className={`tab-btn ${activeTab === "EMPLOYEE" ? "active" : ""}`}
          onClick={() => setActiveTab("EMPLOYEE")}
        >
          Employees ({employeeList.length})
        </button>
      </div>

      {currentData.length > 0 ? (
        renderTable(currentData)
      ) : (
        <p className="empty-text">No records found</p>
      )}

      {/* SHIFT MODAL */}
      {showShiftModal && selectedEmp && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Shift</h3>

            <p className="emp-name">
              {selectedEmp.firstName} ({selectedEmp.employeeId})
            </p>

            <label>Shift</label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
            >
              <option value="">Select shift</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shiftName} ({formatTime12Hour(s.startTime)} -{" "}
                  {formatTime12Hour(s.endTime)})
                </option>
              ))}
            </select>

            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {shiftMsg && <p className="msg">{shiftMsg}</p>}

            <div className="modal-actions">
              <button onClick={updateShift}>Save</button>
              <button className="cancel" onClick={closeShiftModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {selectedEmployeeId && (
        <EmployeeProfileModal
          employeeId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
        />
      )}
    </div>
  );
};

export default AllEmployee;
