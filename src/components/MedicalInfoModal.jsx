import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/MedicalInfoModal.css"
import { getUser } from "../utils/auth";

const MedicalInfoModal = ({ onClose }) => {

  const user = getUser();
  const employeeId = user.employeeId?.toUpperCase();

  const [form, setForm] = useState({
    hasMedicalIssue: false,
    medicalDetails: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  /* ================= FETCH EXISTING MEDICAL INFO ================= */
  useEffect(() => {
    const loadMedicalInfo = async () => {
      try {
        const res = await api.get(
          `user/getprofile/medical/${employeeId}`
        );

        if (res.data) {
          setForm({
            hasMedicalIssue: res.data.hasMedicalIssue || false,
            medicalDetails: res.data.medicalDetails || "",
          });
          setIsUpdate(true);
        }
      } catch (err) {
        console.log(err);
        // No medical info → ADD mode
        setIsUpdate(false);
      }
    };

    if (employeeId) {
      loadMedicalInfo();
    }
  }, [employeeId]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        hasMedicalIssue: form.hasMedicalIssue,
        medicalDetails: form.hasMedicalIssue
          ? form.medicalDetails
          : null,
      };

      if (form.hasMedicalIssue && !form.medicalDetails.trim()) {
        setError("Medical details are required");
        setLoading(false);
        return;
      }

      if (isUpdate) {
        await api.put(
          `user/updateprofile/medical?employeeId=${employeeId}`,
          payload
        );
      } else {
        await api.post(
          `user/addprofile/medical?employeeId=${employeeId}`,
          payload
        );
      }

      alert(
        isUpdate
          ? "Medical information updated successfully"
          : "Medical information added successfully"
      );

      onClose();

    } catch (err) {
      setError(
        err.response?.data ||
        err.message ||
        "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="medical-modal-overlay">
      <div className="medical-modal">
        <h2>{isUpdate ? "Update Medical Info" : "Add Medical Info"}</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="hasMedicalIssue"
              checked={form.hasMedicalIssue}
              onChange={handleChange}
            />
            I have a medical condition
          </label>

          {form.hasMedicalIssue && (
            <>
              <label>Medical Details</label>
              <textarea
                name="medicalDetails"
                value={form.medicalDetails}
                onChange={handleChange}
                placeholder="Describe medical condition"
                rows={3}
                required
              />
            </>
          )}

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
              {loading
                ? "Saving..."
                : isUpdate
                ? "Update"
                : "Save"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MedicalInfoModal;
