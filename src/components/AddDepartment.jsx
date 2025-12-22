import { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ USE JWT AXIOS INSTANCE
import "../styles/AddDepartment.css";

const AddDepartment = () => {
   

  const [deptName, setDeptName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  /* ================= FETCH ================= */
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department/fetchAll"); // ✅ FIXED
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      console.log(sessionStorage.getItem("token")
);

    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ================= DEPARTMENT MODAL ================= */
  const openAddModal = () => {
    setDeptName("");
    setEditingId(null);
    setMessage("");
    setError(false);
    setShowDeptModal(true);
  };

  const openEditModal = (dept) => {
    setDeptName(dept.deptName);
    setEditingId(dept.id);
    setMessage("");
    setError(false);
    setShowDeptModal(true);
  };

  const closeDeptModal = () => {
    setShowDeptModal(false);
    setDeptName("");
    setEditingId(null);
  };

  /* ================= EMPLOYEE MODAL ================= */
  const openEmployeeModal = (dept) => {
    setSelectedDept(dept);
    setShowEmpModal(true);
  };

  const closeEmployeeModal = () => {
    setSelectedDept(null);
    setShowEmpModal(false);
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deptName.trim()) {
      setError(true);
      setMessage("Department name is required");
      return;
    }

    try {
      setLoading(true);
      setError(false);

      if (editingId) {
        await api.put(`/department/update/${editingId}`, { deptName }); // ✅ FIXED
        setMessage("Department updated successfully");
      } else {
        await api.post("/department/add", { deptName }); // ✅ FIXED
        setMessage("Department added successfully");
      }

      fetchDepartments();
      setTimeout(closeDeptModal, 800);
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DISABLE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to disable this department?")) {
      return;
    }

    try {
      await api.delete(`/department/disable/${id}`); // ✅ FIXED
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dept-container">
      {/* ===== HEADER ===== */}
      <div className="dept-header">
        <h2>Departments</h2>
        <button className="add-btn" onClick={openAddModal}>
          + Add Department
        </button>
      </div>

      {/* ===== LIST ===== */}
      <div className="dept-list-card">
        {departments.length === 0 ? (
          <p className="empty-text">No departments found</p>
        ) : (
          <table className="dept-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department</th>
                <th>Employees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>

                  <td
                    className="dept-link"
                    onClick={() => openEmployeeModal(dept)}
                  >
                    {dept.deptName}
                  </td>

                  <td>{dept.employees?.length || 0}</td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(dept)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== ADD / EDIT MODAL ===== */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingId ? "Edit Department" : "Add Department"}</h3>

            <form onSubmit={handleSubmit}>
              <label>Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Enter department name"
              />

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeDeptModal}
                >
                  Cancel
                </button>
              </div>
            </form>

            {message && (
              <p className={`message ${error ? "error" : "success"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== EMPLOYEE MODAL ===== */}
      {showEmpModal && selectedDept && (
        <div className="modal-overlay">
          <div className="modal large">
            <h3>
              Employees – {selectedDept.deptName} (
              {selectedDept.employees.length})
            </h3>

            {selectedDept.employees.length === 0 ? (
              <p>No employees in this department</p>
            ) : (
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDept.employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>{emp.employeeId}</td>
                      <td>
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="modal-actions">
              <button onClick={closeEmployeeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDepartment;
