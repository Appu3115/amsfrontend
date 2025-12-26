import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllEmployee.css";

const AllEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState("active");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedShift, setSelectedShift] = useState("");
  const [startDate, setStartDate] = useState(""); // ✅ NEW

  const [shifts, setShifts] = useState([]);
  const [shiftLoading, setShiftLoading] = useState(false);

  // Save feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/user/allemployeesdetails");
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to load employee details");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      setShiftLoading(true);
      const res = await api.get("/shift/getAllShift");
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setShiftLoading(false);
    }
  };

  const activeEmployees = employees.filter(emp => emp.active);
  const inactiveEmployees = employees.filter(emp => !emp.active);

  const openShiftModal = (employee) => {
    setSelectedEmployee(employee);
    setSelectedShift("");
    setStartDate(""); // reset
    setSuccessMsg("");
    setErrorMsg("");
    setShowModal(true);
    fetchShifts();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setSelectedShift("");
    setStartDate("");
  };

  // 🔥 ASSIGN / UPDATE SHIFT
  const handleSaveShift = async () => {
    if (!selectedEmployee || !selectedShift || !startDate) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      employeeId: selectedEmployee.employeeId,
      shiftId: Number(selectedShift),
      startDate: startDate, // ✅ USER SELECTED DATE
    };

    try {
      let res;

      if (selectedEmployee.shift) {
        res = await api.put("/employeeshift/update", payload);
      } else {
        res = await api.post("/employeeshift/assign", payload);
      }

      setSuccessMsg(res.data.message);
      await fetchEmployees();
      closeModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const formatTime12Hour = (time) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(emp => (
            <tr key={emp.employeeId}>
              <td>{emp.employeeId}</td>
              <td>{emp.firstName} {emp.lastName}</td>
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
                  ? `${emp.shift.shiftName} (${formatTime12Hour(emp.shift.startTime)} - ${formatTime12Hour(emp.shift.endTime)})`
                  : "-"}
              </td>
              <td>
                <button className="shift-btn" onClick={() => openShiftModal(emp)}>
                  {emp.shift ? "Update Shift" : "Assign Shift"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const currentData = activeTab === "active" ? activeEmployees : inactiveEmployees;

  return (
    <div className="admin-emp-container">
      <h2 className="page-title">Employee Management</h2>
      <p className="page-subtitle">View all registered employees</p>

      {successMsg && <p className="success-text">{successMsg}</p>}
      {errorMsg && <p className="error-text">{errorMsg}</p>}

      {/* TABS */}
      <div className="emp-tabs">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Employees ({activeEmployees.length})
        </button>

        <button
          className={`tab-btn ${activeTab === "inactive" ? "inactive" : ""}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Employees ({inactiveEmployees.length})
        </button>
      </div>

      {currentData.length > 0 ? renderTable(currentData) : <p className="empty-text">No employees found</p>}

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{selectedEmployee?.shift ? "Update Shift" : "Assign Shift"}</h3>

            <p className="modal-emp-name">
              Employee: <strong>{selectedEmployee?.firstName}</strong>
            </p>

            {/* DATE PICKER */}
            <input
              type="date"
              className="shift-select"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {/* SHIFT SELECT */}
            <select
              className="shift-select"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="">Select Shift</option>
              {shiftLoading && <option disabled>Loading shifts...</option>}
              {!shiftLoading && shifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.shiftName} ({formatTime12Hour(shift.startTime)} - {formatTime12Hour(shift.endTime)})
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={!selectedShift || !startDate || saving}
                onClick={handleSaveShift}
              >
                {saving ? "Saving..." : selectedEmployee?.shift ? "Update Shift" : "Assign Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployee;
