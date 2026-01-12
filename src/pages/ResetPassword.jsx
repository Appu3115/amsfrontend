import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/ResetPassword.css";
import { useLocation } from "react-router-dom";
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

const ResetPassword = () => {
  const navigate = useNavigate();
const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [timer, setTimer] = useState(OTP_EXPIRY_SECONDS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  /* ⏱ OTP Countdown */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);
useEffect(() => {
  if (location.state?.email) {
    setForm((prev) => ({
      ...prev,
      email: location.state.email
    }));
  }
}, [location.state]);
  const formatTime = () => {
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔢 OTP masking (digits only, max 6)
    if (name === "otp") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await api.post("/user/reset-password", form);
      setMessage(res.data);

      // ✅ Auto-redirect to login after success
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err) {
      setError(true);
      setMessage(err.response?.data || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-container">
      <div className="rp-card">
        <h2>Reset Password</h2>
        <p className="subtitle">
          Enter the OTP sent to your email
        </p>

        {/* ⏱ Timer */}
        <div className={`otp-timer ${timer <= 60 ? "danger" : ""}`}>
          OTP expires in {formatTime()}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Registered Email"
            onChange={handleChange}
            required
          />

          <input
            name="otp"
            type="password"
            placeholder="6-digit OTP"
            value={form.otp}
            onChange={handleChange}
            inputMode="numeric"
            required
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            minLength={8}
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          {message && (
            <p className={`msg ${error ? "error" : "success"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || timer <= 0}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {timer <= 0 && (
          <p className="expired">
            OTP expired. Please request a new one.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
