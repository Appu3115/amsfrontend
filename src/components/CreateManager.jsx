import { useState } from "react";
import api from "../api/axios";
import "../styles/CreateManager.css";

const CreateManager = ({ isOpen, onClose, onSuccess }) => {
  const admin = JSON.parse(sessionStorage.getItem("user_admin"));

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentName: "",
    joinDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post(
        `/user/create-manager?adminEmployeeId=${admin.employeeId}`,
        form
      );

      setSuccess("Manager created successfully. Credentials sent via email.");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data || "Failed to create manager"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <h2>Create Manager</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
            name="departmentName"
            placeholder="Department Name"
            value={form.departmentName}
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
            {loading ? "Creating..." : "Create Manager"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CreateManager;
