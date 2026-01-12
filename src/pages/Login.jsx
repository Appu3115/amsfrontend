import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
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

      const role = data.role?.toLowerCase();
      if (!role) throw new Error("Role missing in login response");

      // 🧹 Clear previous session
      sessionStorage.clear();

      // ✅ Store user by role
      sessionStorage.setItem(`user_${role}`, JSON.stringify(data));

      // 🚀 Direct login to dashboard
      navigateToDashboard(role);

    } catch (err) {
      if (err.response) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : "Invalid email or password"
        );
      } else {
        setError("Backend not responding");
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToDashboard = (role) => {
    switch (role) {
      case "admin":
        navigate("/admindashboard", { replace: true });
        break;
      case "manager":
        navigate("/managerdashboard", { replace: true });
        break;
      case "employee":
        navigate("/employeedashboard", { replace: true });
        break;
      default:
        navigate("/login", { replace: true });
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
            type="email"
            placeholder="Email"
            value={form.email}
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
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
