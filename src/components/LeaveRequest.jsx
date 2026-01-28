import React, { useState } from "react";
import api from "../api/axios";
import "../styles/LeaveRequest.css";
import { getUser } from "../utils/auth";

const CLOUD_NAME = "dangvotkt";
const UPLOAD_PRESET = "amsproject";

const LeaveRequest = ({ onClose }) => {
  const user = getUser();
  const employeeId = user?.employeeId?.toUpperCase();

  const [form, setForm] = useState({
    leaveType: "",
    reason: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= HELPERS ================= */

  const extractErrorMessage = (err) => {
    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        return err.response.data;
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
    }
    return err.message || "Failed to apply leave";
  };

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  /* ================= CLOUD UPLOAD ================= */

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: data }
    );

    const result = await res.json();

    if (!result.secure_url) {
      throw new Error("Cloud upload failed");
    }

    return result.secure_url;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!employeeId) {
      setError("Employee not logged in");
      setLoading(false);
      return;
    }

    try {
      // Upload proofs (if any)
      let proofUrls = [];

      if (files.length > 0) {
        proofUrls = await Promise.all(
          files.map((file) => uploadToCloudinary(file))
        );
      }

      // Payload should match backend DTO
      const payload = {
        leaveType: form.leaveType,
        reason: form.reason,
        description: form.description || null,
        startDate: form.startDate,
        endDate: form.endDate,
        proofUrls,
      };

      await api.post(
        `/leave/applyleave`,
        payload,
        { params: { employeeId } }
      );

      alert("Leave applied successfully");
      onClose();
    } catch (err) {
      console.error("Apply leave failed:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

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
            <option value="CASUAL">Casual Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="EARNED">Earned Leave</option>
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
            <option value="FAMILY">Family</option>
            <option value="FEVER">Fever</option>
          </select>

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description"
            rows={3}
          />

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
