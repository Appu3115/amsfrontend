import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/ChangePassword.css";

const ChangePassword = ({ passwordChanged, onClose }) => {
  const navigate = useNavigate();

  const storedUser = sessionStorage.getItem("user_manager");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const employeeId = user?.employeeId;
  const role = user?.role;

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    if (!employeeId) {
      setError(true);
      setMessage("Employee ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        employeeId,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      };

      if (passwordChanged) {
        payload.oldPassword = form.oldPassword;
      }

      const res = await api.post("/user/change-password", payload);
      setMessage(res.data);

      // ✅ Update forcePasswordChange flag
      if (!passwordChanged) {
        const updatedUser = { ...user, forcePasswordChange: false };
        sessionStorage.setItem("user_manager", JSON.stringify(updatedUser));
      }

      // ✅ Auto close / redirect
      setTimeout(() => {
        if (!passwordChanged) {
          navigate(role === "MANAGER" ? "/managerdashboard" : "/employeedashboard");
        } else {
          onClose(); // normal password change
        }
      }, 800);

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      setError(true);
      setMessage(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-card">
      {/* ❌ Close Button */}
      <button className="cp-close" onClick={onClose}>
        ×
      </button>

      <div className="cp-header">
        <h2>Change Password</h2>
        {!passwordChanged && (
          <p className="cp-subtitle">
            First login detected. You must change your password.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="cp-form">
        {passwordChanged && (
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {message && (
          <p className={`cp-message ${error ? "error" : "success"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary full-width"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
