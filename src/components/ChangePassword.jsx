import { useState, useMemo } from "react";
import api from "../api/axios";
import "../styles/ChangePassword.css";

/*
  POPUP-ONLY CHANGE PASSWORD
  - Triggered from dashboard button
  - Auto-detects FIRST vs NORMAL change
*/
const ChangePassword = ({ onClose }) => {
  /* ================= USER FROM SESSION ================= */
  const user = useMemo(() => {
    const manager = sessionStorage.getItem("user_manager");
    const employee = sessionStorage.getItem("user_employee");
    const admin = sessionStorage.getItem("user_admin");

    return manager
      ? JSON.parse(manager)
      : employee
      ? JSON.parse(employee)
      : admin
      ? JSON.parse(admin)
      : null;
  }, []);

  const employeeId = user?.employeeId;
  const role = user?.role;
  const isFirstChange = user?.forcePasswordChange === true;

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError(true);
      setMessage("Passwords do not match");
      return;
    }

    if (!employeeId) {
      setError(true);
      setMessage("Session expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        employeeId,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      };

      // Old password required ONLY for normal change
      if (!isFirstChange) {
        payload.oldPassword = form.oldPassword;
      }

      const res = await api.post("/user/change-password", payload);
      setMessage(res.data || "Password updated successfully");

      // ✅ Update session flag after first change
      if (isFirstChange) {
        const updatedUser = { ...user, forcePasswordChange: false };

        if (role === "MANAGER") {
          sessionStorage.setItem("user_manager", JSON.stringify(updatedUser));
        } else if (role === "EMPLOYEE") {
          sessionStorage.setItem("user_employee", JSON.stringify(updatedUser));
        } else if (role === "ADMIN") {
          sessionStorage.setItem("user_admin", JSON.stringify(updatedUser));
        }
      }

      // Auto-close after success
      setTimeout(onClose, 800);

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      setError(true);
      setMessage(err.response?.data || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="cp-overlay">
      <div className="cp-card">
        <button className="cp-close" onClick={onClose}>×</button>

        <div className="cp-header">
          <h2>Change Password</h2>
          {isFirstChange && (
            <p className="cp-subtitle">
              First time login detected. Please set a new password.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="cp-form">
          {!isFirstChange && (
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
              minLength={8}
              required
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
    </div>
  );
};

export default ChangePassword;
