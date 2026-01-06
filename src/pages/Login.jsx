import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    employeeId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/user/login", form);
      const data = res.data;

      // 🔐 Get role from backend response
      const role = data.role?.toUpperCase();

      if (!role) {
        throw new Error("Role missing in login response");
      }

      // 🧹 Clear any previous sessions
      sessionStorage.removeItem("user_admin");
      sessionStorage.removeItem("user_employee");

      // ✅ Store user with ROLE IN KEY
      const userKey = `user_${role.toLowerCase()}`;
      sessionStorage.setItem(userKey, JSON.stringify(data));

      // 🚀 Redirect (replace kills browser back to login)
      if (role === "ADMIN") {
        navigate("/admindashboard", { replace: true });
      } else {
        navigate("/employeedashboard", { replace: true });
      }

    } catch (err) {
      if (err.response) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : "Invalid credentials"
        );
      } else {
        setError("Backend not responding");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="employeeId"
            placeholder="Employee ID"
            value={form.employeeId}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
