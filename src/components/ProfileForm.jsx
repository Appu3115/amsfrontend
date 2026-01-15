import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/ProfileForm.css";

const CLOUD_NAME = "dangvotkt";
const UPLOAD_PRESET = "amsproject";

const getLoggedUser = () =>
  JSON.parse(sessionStorage.getItem("user_admin")) ||
  JSON.parse(sessionStorage.getItem("user_manager")) ||
  JSON.parse(sessionStorage.getItem("user_employee"));

const ProfileForm = () => {
  const user = getLoggedUser();
  const employeeId = user?.employeeId;

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/user/getprofile/${employeeId}`);
      setProfile(res.data);
      setForm({
        imageURL: res.data.imageURL || "",
        address: res.data.address || "",
        emergencyContact1: res.data.emergencyContact1 || "",
        emergencyContact2: res.data.emergencyContact2 || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) loadProfile();
  }, [employeeId]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!profile?.address) {
        await api.post(`/user/createprofile/${employeeId}`, form);
      } else {
        await api.put(`/user/update/${employeeId}`, form);
      }
      setOpenEdit(false);
      loadProfile();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading profile…</div>;

  return (
    <div className="profile-page">

      {/* ===== HERO SECTION ===== */}
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

        <button className="edit-btn" onClick={() => setOpenEdit(true)}>
          {profile?.address ? "Edit Profile" : "Create Profile"}
        </button>
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
      </div>

      {/* ===== MODAL ===== */}
      {openEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{profile?.address ? "Update Profile" : "Create Profile"}</h3>

            <input
              type="file"
              onChange={async (e) =>
                setForm({
                  ...form,
                  imageURL: await uploadImage(e.target.files[0]),
                })
              }
            />

            {uploading && <p className="muted">Uploading image…</p>}
            {form.imageURL && <img src={form.imageURL} className="preview-img" />}

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
              <button className="edit-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
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
