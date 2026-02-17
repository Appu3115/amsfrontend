import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AllEmployee.css";
import { getUser } from "../utils/auth";
import EmployeeProfileModal from "./EmployeeProfileModal";

const AllEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [confirmationRequests, setConfirmationRequests] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const [activeTab, setActiveTab] = useState("EMPLOYEE");

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

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
    fetchConfirmationRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/getAllEmployees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err)
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmationRequests = async () => {
    try {
      const res = await api.get("/user/confirmation-requests");
      setConfirmationRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
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

  /* ================= CONFIRM / REJECT ================= */

  const confirmEmployee = async (employeeId) => {
    try {
      setActionLoading(employeeId);
      await api.put(`/user/${employeeId}/confirm`);
      await fetchEmployees();
      await fetchConfirmationRequests();
    } catch (err) {
      alert(err.response?.data || "Confirmation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectEmployee = async (employeeId) => {
    try {
      setActionLoading(employeeId);
      await api.put(`/user/${employeeId}/reject`);
      await fetchEmployees();
      await fetchConfirmationRequests();
    } catch (err) {
      alert(err.response?.data || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= DELETE ================= */

  const deleteEmployee = async (employeeId) => {
    const ok = window.confirm(
      `Are you sure you want to delete employee ${employeeId}?`
    );
    if (!ok) return;

    try {
      setActionLoading(employeeId);
      await api.delete(`/user/delete/${employeeId}`);
      await fetchEmployees();
    } catch (err) {
      alert(err.response?.data || "Delete failed");
    } finally {
      setActionLoading(null);
    }
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
      setShiftMsg("Shift and start date required");
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
      console.log(err)
      setShiftMsg("Shift update failed");
    }
  };

  /* ================= FILTER ================= */

  const managers = employees.filter((e) => e.role === "MANAGER");
  const employeeList = employees.filter((e) => e.role === "EMPLOYEE");

  const currentData =
    activeTab === "MANAGER" ? managers : employeeList;

  /* ================= MAIN TABLE ================= */

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

              <td>
                <span
                  className="emp-name-link"
                  onClick={() =>
                    loggedInRole === "ADMIN" &&
                    setSelectedEmployeeId(emp.employeeId)
                  }
                >
                  {emp.firstName} {emp.lastName}
                </span>
              </td>

              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.role}</td>
              <td>{emp.department?.deptName || "-"}</td>

              <td>
                {emp.shift
                  ? `${emp.shift.shiftName} (${emp.shift.startTime} - ${emp.shift.endTime})`
                  : "-"}
              </td>

              <td className="action-cell">
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

                {loggedInRole === "ADMIN" && (
                  <button
                    className="delete-btn"
                    disabled={actionLoading === emp.employeeId}
                    onClick={() =>
                      deleteEmployee(emp.employeeId)
                    }
                  >
                    {actionLoading === emp.employeeId
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ================= REQUEST TABLE ================= */

  const renderRequestsTable = () => (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Shift</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {confirmationRequests.map((emp) => (
            <tr key={emp.employeeId}>
              <td>{emp.employeeId}</td>
              <td>{emp.employeeName}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.shift || "-"}</td>
              <td>{emp.status}</td>

              <td className="action-cell">
                <button
                  className="confirm-btn"
                  disabled={actionLoading === emp.employeeId}
                  onClick={() =>
                    confirmEmployee(emp.employeeId)
                  }
                >
                  Accept
                </button>

                <button
                  className="reject-btn"
                  disabled={actionLoading === emp.employeeId}
                  onClick={() =>
                    rejectEmployee(emp.employeeId)
                  }
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ================= RENDER ================= */

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-emp-container">
      <h2>Employee Management</h2>

      <div className="emp-tabs">
        <button
          className={activeTab === "MANAGER" ? "active" : ""}
          onClick={() => setActiveTab("MANAGER")}
        >
          Managers ({managers.length})
        </button>

        <button
          className={activeTab === "EMPLOYEE" ? "active" : ""}
          onClick={() => setActiveTab("EMPLOYEE")}
        >
          Employees ({employeeList.length})
        </button>

        <button
          className={activeTab === "REQUESTS" ? "active" : ""}
          onClick={() => setActiveTab("REQUESTS")}
        >
          Confirmation Requests ({confirmationRequests.length})
        </button>
      </div>

      {activeTab === "REQUESTS"
        ? confirmationRequests.length > 0
          ? renderRequestsTable()
          : <p>No pending confirmation requests</p>
        : currentData.length > 0
        ? renderTable(currentData)
        : <p>No records found</p>}

      {/* SHIFT MODAL */}
      {showShiftModal && selectedEmp && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Shift</h3>

            <label>Shift</label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
            >
              <option value="">Select shift</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shiftName}
                </option>
              ))}
            </select>

            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {shiftMsg && <p>{shiftMsg}</p>}

            <div className="modal-actions">
              <button onClick={updateShift}>Save</button>
              <button onClick={closeShiftModal}>Cancel</button>
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
