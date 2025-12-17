import { useState,} from "react";
import axios from "axios";
import useAuth from "../auth/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    employeeId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("➡️ Login form data:", form);

    try {
      console.log("➡️ Sending login request to backend...");

      const res = await axios.post(
        "http://localhost:8080/user/login",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Full API response:", res);
      console.log("✅ Response data:", res.data);

      const data = res.data;

      // store user + token
      login(data);

      const role = data.role?.toUpperCase();
      console.log("🔐 Logged-in role:", role);

      if (role === "ADMIN") {
        navigate("/admindashboard");
      } else {
        navigate("/employeedashboard");
      }
    } catch (err) {
      console.error("❌ Login error object:", err);

      if (err.response) {
        console.error("❌ Status:", err.response.status);
        console.error("❌ Backend error data:", err.response.data);
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : "Server error"
        );
      } else if (err.request) {
        console.error("❌ No response from backend:", err.request);
        setError("Backend not responding (check server / CORS)");
      } else {
        console.error("❌ Axios config error:", err.message);
        setError("Unexpected error: " + err.message);
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
