import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/EmployeeProfileModal.css";

const EmployeeProfileModal = ({ employeeId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) fetchProfile();
  }, [employeeId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/employees/profiles");
      const empProfile = res.data.find(
        (p) => p.employeeId === employeeId
      );
      setProfile(empProfile || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!employeeId || loading || !profile) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="profile-modal compact"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon */}
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        {/* HEADER */}
        <div className="profile-header">
          <img
            src={profile.profile?.imageURL}
            alt="Profile"
            className="profile-img"
          />

          <div>
            <h3>{profile.name}</h3>
            <p className="muted">
              {profile.employeeId} • {profile.role}
            </p>
            <span className="status-pill">
              {profile.status}
            </span>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <h4 className="section-title">Personal Information</h4>

        <div className="profile-grid">
          <div>
            <label>Email</label>
            <p>{profile.email}</p>
          </div>

          <div>
            <label>Phone</label>
            <p>{profile.phone}</p>
          </div>

          <div className="full">
            <label>Address</label>
            <p>{profile.profile?.address || "-"}</p>
          </div>

          <div>
            <label>Department</label>
            <p>{profile.department?.name || "-"}</p>
          </div>

          <div>
            <label>Shift</label>
            <p>
              {profile.shift
                ? `${profile.shift.shiftName} (${profile.shift.startTime} - ${profile.shift.endTime})`
                : "-"}
            </p>
          </div>
        </div>

        {/* EMERGENCY CONTACTS */}
        <h4 className="section-title">Emergency Contacts</h4>

        <div className="profile-grid">
          <div>
            <label>Contact 1</label>
            <p>{profile.profile?.emergencyContact1 || "-"}</p>
          </div>

          <div>
            <label>Contact 2</label>
            <p>{profile.profile?.emergencyContact2 || "-"}</p>
          </div>
        </div>

        {/* MEDICAL INFORMATION */}
        <div className="medical-card">
          <h4>Medical Information</h4>
          <p>
            <strong>Has Medical Issue:</strong>{" "}
            <span
              className={
                profile.medical?.hasMedicalIssue ? "yes" : "no"
              }
            >
              {profile.medical?.hasMedicalIssue ? "Yes" : "No"}
            </span>
          </p>

          {profile.medical?.hasMedicalIssue && (
            <p>
              <strong>Details:</strong>{" "}
              {profile.medical.medicalDetails}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
