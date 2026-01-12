import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/CreateManager.css";

const CreateManager = ({ isOpen, onClose, onSuccess }) => {
  const admin = JSON.parse(sessionStorage.getItem("user_admin"));

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentName: "",
    joinDate: "",
    shiftId: ""
  };

  const [form, setForm] = useState(initialFormState);
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 Format time to 12h
  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // ================= FETCH SHIFTS + DEPARTMENTS =================
  useEffect(() => {
    if (!isOpen) return;

    setForm(initialFormState);
    setError("");
    setSuccess("");

    const fetchData = async () => {
      try {
        const [shiftRes, deptRes] = await Promise.all([
          api.get("/shift/getAllShift"),
          api.get("/department/fetchAll")
        ]);

        setShifts(shiftRes.data);
        setDepartments(deptRes.data);
      } catch (e) {
        console.error(e);
        setError("Unable to load data");
      }
    };

    fetchData();
  }, [isOpen]);

  const handleClose = () => {
    setForm(initialFormState);
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(
        `/user/create-manager?adminEmployeeId=${admin.employeeId}`,
        {
          ...form,
          shiftId: Number(form.shiftId)
        }
      );

      setSuccess("Manager created successfully. Credentials sent via email.");

      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1200);

    } catch (err) {
      setError(err.response?.data || "Failed to create manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* CLOSE */}
        <button className="close-btn" onClick={handleClose}>×</button>

        <div className="modal-header">
          <h2>Create Manager</h2>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/* ✅ DEPARTMENT DROPDOWN */}
          <select
            name="departmentName"
            value={form.departmentName}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.deptName}>
                {dept.deptName}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="joinDate"
            value={form.joinDate}
            onChange={handleChange}
            required
          />

          {/* SHIFT DROPDOWN */}
          <select
            name="shiftId"
            value={form.shiftId}
            onChange={handleChange}
            required
          >
            <option value="">Select Shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.shiftName} ({shift.shiftType}) —{" "}
                {formatTime12h(shift.startTime)} - {formatTime12h(shift.endTime)}
              </option>
            ))}
          </select>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Manager"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateManager;
