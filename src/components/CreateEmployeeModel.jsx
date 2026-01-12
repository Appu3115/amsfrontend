import { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/CreateManager.css"; // 🔥 reuse same CSS

const CreateEmployeeModal = ({ open, onClose, onSuccess }) => {
  const manager = JSON.parse(sessionStorage.getItem("user_manager"));

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    joinDate: ""
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===== RESET ON OPEN =====
  useEffect(() => {
    if (!open) return;
    setForm(initialFormState);
    setError("");
    setSuccess("");
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleClose = () => {
    setForm(initialFormState);
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(
        `/user/create-employee?managerEmployeeId=${manager.employeeId}`,
        form
      );

      setSuccess("Employee created successfully. Credentials sent via email.");

      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1200);

    } catch (err) {
      setError(err.response?.data || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* ✅ SAME CLOSE BUTTON */}
        <button className="close-btn" onClick={handleClose}>×</button>

        <div className="modal-header">
          <h2>Create Employee</h2>
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

          <input
            type="date"
            name="joinDate"
            value={form.joinDate}
            onChange={handleChange}
            required
          />

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Employee"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
