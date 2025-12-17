import { useState } from "react";
import { registerApi } from "../services/authservice";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";

const DEPARTMENTS = [
  "Java Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "HR",
  "Finance",
  "Accounts",
  "Operations",
];

const Register = () => {
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    departmentName: "",
    role: "EMPLOYEE",
    joinDate: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="register-title">Welcome! Create Account</h2>
        <p className="register-subtitle">
          Register to access the Attendance Management System
        </p>

        <div className="form-row">
          <input
            name="employeeId"
            placeholder="Employee ID"
            onChange={handleChange}
            required
          />

          {/* 🔽 Department Dropdown (Static) */}
          <select
            name="departmentName"
            value={form.departmentName}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <input
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <input
            name="password"
            type="password"
            placeholder="Password"
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
        </div>

        {/* 🔽 Role Dropdown */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
        </select>

        <input
          name="joinDate"
          type="date"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
