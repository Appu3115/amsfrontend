import React, { useState } from "react";
import api from "../api/axios"; // interceptor-based axios
import "../styles/LeaveRequest.css";

const LeaveRequest = ({ onClose }) => {

  const [form, setForm] = useState({
    leaveType: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Handlers =====

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 Backend expects LeaveRequest JSON as "leave"
      const leaveData = {
        leaveType: form.leaveType,
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      const formData = new FormData();

      // Attach JSON part
      formData.append(
        "leave",
        new Blob([JSON.stringify(leaveData)], {
          type: "application/json",
        })
      );

      // Attach files (optional)
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      // ❗ Do NOT set Content-Type manually
      await api.post("/leave/applyleave", formData);

      alert("Leave applied successfully");
      onClose();

    } catch (err) {
      console.error("Apply leave error:", err);

      // Backend sends String messages
      setError(
        err.response?.data ||
        "Failed to apply leave. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        <h2>Apply Leave</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>

          <label>Leave Type</label>
          <select
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="ANNUAL">Annual</option>
          </select>

          <label>Reason</label>
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="PERSONAL">Personal</option>
            <option value="MEDICAL">Medical</option>
            <option value="FAMILY">Family</option>
          </select>

          <div className="date-row">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label>Upload Proof (optional)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />

          <div className="btn-row">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Apply Leave"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;
