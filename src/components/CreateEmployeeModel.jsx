import { useState } from "react";
import api from "../api/axios";
import "../styles/CreateEmployeeModel.css";

const CreateEmployeeModal = ({ open, onClose }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    joinDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await api.post(
        "/user/create-employee",
        form
      );

      setMessage(res.data);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        joinDate: ""
      });

      setTimeout(onClose, 1500);
    } catch (err) {
      setError(true);
      setMessage(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Create Employee</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
            <Input label="Email *" type="email" name="email" value={form.email} onChange={handleChange} />
            <Input label="Phone *" name="phone" maxLength="10" value={form.phone} onChange={handleChange} />
            <Input label="Join Date *" type="date" name="joinDate" value={form.joinDate} onChange={handleChange} />
          </div>

          {message && (
            <p className={`form-message ${error ? "error" : "success"}`}>
              {message}
            </p>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Reusable Input */
const Input = ({ label, ...props }) => (
  <div className="form-group">
    <label>{label}</label>
    <input {...props} required={label.includes("*")} />
  </div>
);

export default CreateEmployeeModal;
