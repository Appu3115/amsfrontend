import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "../styles/ProfileForm.css";
import ChangePassword from "../components/ChangePassword";
import MedicalInfoModal from "../components/MedicalInfoModal";

const CLOUD_NAME = "dangvotkt";
const UPLOAD_PRESET = "amsproject";

const getLoggedUser = () =>
  JSON.parse(sessionStorage.getItem("user_admin")) ||
  JSON.parse(sessionStorage.getItem("user_manager")) ||
  JSON.parse(sessionStorage.getItem("user_employee"));

const ProfileForm = () => {
  const user = getLoggedUser();
  const employeeId = user?.employeeId;

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);

  const [profile, setProfile] = useState(null);
  const [medical, setMedical] = useState(null);

  const [form, setForm] = useState({
    imageURL: "",
    address: "",
    emergencyContact1: "",
    emergencyContact2: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===== Image adjust ===== */
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  /* ================= LOAD PROFILE + MEDICAL ================= */
  const loadProfile = async () => {
    try {
      // Profile
      const res = await api.get(`/user/getprofile/${employeeId}`);
      setProfile(res.data);

      setForm({
        imageURL: res.data.imageURL || "",
        address: res.data.address || "",
        emergencyContact1: res.data.emergencyContact1 || "",
        emergencyContact2: res.data.emergencyContact2 || "",
      });

      // Medical info (optional)
      try {
        const medicalRes = await api.get(
          `/user/getprofile/medical/${employeeId}`
        );
        setMedical(medicalRes.data);
      } catch {
        setMedical(null);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) loadProfile();
  }, [employeeId]);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (file) => {
    setUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );

    const result = await res.json();
    setUploading(false);
    return result.secure_url;
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    setSaving(true);

    try {
      let imageURL = form.imageURL;

      if (selectedFile) {
        imageURL = await uploadImage(selectedFile);
      }

      const payload = { ...form, imageURL };

      if (!profile?.address) {
        await api.post(`/user/createprofile/${employeeId}`, payload);
      } else {
        await api.put(`/user/update/${employeeId}`, payload);
      }

      setOpenEdit(false);
      setSelectedFile(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      loadProfile();

    } finally {
      setSaving(false);
    }
  };

  /* ================= IMAGE DRAG ================= */
  const handleMouseDown = (e) => {
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  if (loading) {
    return <div className="profile-loading">Loading profile…</div>;
  }

  return (
    <div className="profile-page">
      {/* ===== HERO ===== */}
      <div className="profile-hero">
        <img
          src={
            profile?.imageURL ||
            `https://ui-avatars.com/api/?name=${profile?.name}&background=FF7A18&color=fff`
          }
          className="profile-avatar"
          alt="Profile"
        />

        <h1>{profile?.name}</h1>

        <div className="profile-meta">
          <span>{profile?.role}</span>
          <span className="dot" />
          <span>{profile?.status}</span>
          <span className="dot" />
          <span>{profile?.department?.name}</span>
        </div>

        <div className="profile-actions">
          <button className="edit-btn" onClick={() => setOpenEdit(true)}>
            {profile?.address ? "Edit Profile" : "Create Profile"}
          </button>

          <button
            className="edit-btn secondary"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>

          <button
            className="edit-btn secondary"
            onClick={() => setShowMedicalModal(true)}
          >
            Medical Info
          </button>
        </div>
      </div>

      {/* ===== DETAILS ===== */}
      <div className="profile-sections">
        <section>
          <h3>Basic Information</h3>
          <div className="info-grid">
            <Info label="Employee ID" value={profile?.employeeId} />
            <Info label="Email" value={profile?.email} />
            <Info label="Phone" value={profile?.phone} />
          </div>
        </section>

        <section>
          <h3>Work Details</h3>
          <div className="info-grid">
            <Info label="Department" value={profile?.department?.name} />
            <Info label="Shift" value={profile?.shift?.shiftName} />
            <Info label="Join Date" value={profile?.joinDate} />
          </div>
        </section>

        <section>
          <h3>Contact & Emergency</h3>
          <div className="info-grid">
            <Info wide label="Address" value={profile?.address || "-"} />
            <Info label="Emergency Contact 1" value={profile?.emergencyContact1 || "-"} />
            <Info label="Emergency Contact 2" value={profile?.emergencyContact2 || "-"} />
          </div>
        </section>

        {/* ===== MEDICAL INFO ===== */}
        <section>
          <h3>Medical Information</h3>
          <div className="info-grid">
            <Info
              label="Medical Issue"
              value={
                medical?.hasMedicalIssue === true
                  ? "Yes"
                  : medical?.hasMedicalIssue === false
                  ? "No"
                  : "-"
              }
            />
            <Info
              wide
              label="Medical Details"
              value={
                medical?.hasMedicalIssue
                  ? medical?.medicalDetails || "-"
                  : "Not Applicable"
              }
            />
          </div>
        </section>
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {openEdit && (
        <div
          className="modal-overlay"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="modal">
            <h3>{profile?.address ? "Update Profile" : "Create Profile"}</h3>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            {(selectedFile || form.imageURL) && (
              <div className="image-adjust-wrapper">
                <div
                  className="image-crop-circle"
                  onMouseDown={handleMouseDown}
                  style={{ cursor: dragging ? "grabbing" : "grab" }}
                >
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : form.imageURL
                    }
                    alt="Preview"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="zoom-slider"
                />
              </div>
            )}

            <textarea
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              placeholder="Emergency Contact 1"
              value={form.emergencyContact1}
              onChange={(e) =>
                setForm({ ...form, emergencyContact1: e.target.value })
              }
            />

            <input
              placeholder="Emergency Contact 2"
              value={form.emergencyContact2}
              onChange={(e) =>
                setForm({ ...form, emergencyContact2: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setOpenEdit(false)}>Cancel</button>
              <button
                className="edit-btn"
                onClick={handleSave}
                disabled={saving || uploading}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHANGE PASSWORD ===== */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}

      {/* ===== MEDICAL MODAL ===== */}
      {showMedicalModal && (
        <MedicalInfoModal
          onClose={() => {
            setShowMedicalModal(false);
            loadProfile(); // 🔄 refresh medical info
          }}
        />
      )}
    </div>
  );
};

const Info = ({ label, value, wide }) => (
  <div className={`info-item ${wide ? "wide" : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default ProfileForm;
