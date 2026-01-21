import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/Shifts.css";

/* ===== Helpers ===== */
const getShiftType = (start, end) => {
  if (end < start) return "Night";
  if (start >= "16:00") return "Evening";
  return "Day";
};

const to12Hour = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
};

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newShift, setNewShift] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    graceMinutes: 10,
    sundayOff: false,
    allSaturdayOff: false,
    alternateSaturdayOff: false,
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shift/getAllShift");
      setShifts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleAddShift = async (e) => {
    e.preventDefault();
    await api.post("/shift/addShift", newShift);
    fetchShifts();
    setShowModal(false);
    setNewShift({
      shiftName: "",
      startTime: "",
      endTime: "",
      graceMinutes: 10,
      sundayOff: false,
      allSaturdayOff: false,
      alternateSaturdayOff: false,
    });
  };

  const filteredShifts =
    filter === "ALL"
      ? shifts
      : shifts.filter(
          (s) => getShiftType(s.startTime, s.endTime) === filter
        );

  return (
    <div className="shifts-page">
      {/* Header */}
      <div className="shifts-header">
        <div>
          <h2>Shift Management</h2>
          <p>Define working hours, grace time & weekly offs</p>
        </div>
        <button className="shifts-add-btn" onClick={() => setShowModal(true)}>
          + Add Shift
        </button>
      </div>

      {/* Filter */}
      <div className="shifts-filter">
        {["ALL", "Day", "Evening", "Night"].map((type) => (
          <button
            key={type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="shifts-list">
        {loading ? (
          <p className="shifts-info">Loading shifts...</p>
        ) : filteredShifts.length === 0 ? (
          <p className="shifts-info">No shifts found</p>
        ) : (
          filteredShifts.map((shift) => {
            const type = getShiftType(shift.startTime, shift.endTime);
            return (
              <div className="shifts-card" key={shift.id}>
                <div>
                  <h4>{shift.shiftName}</h4>
                  <span className={`shifts-badge ${type.toLowerCase()}`}>
                    {type}
                  </span>
                </div>

                <div className="shifts-time">
                  <strong>
                    {to12Hour(shift.startTime)} – {to12Hour(shift.endTime)}
                  </strong>
                  <small>Grace: {shift.graceMinutes} mins</small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
{showModal && (
  <div className="shifts-modal-overlay">
    <div className="shifts-modal">
      <h3>Add New Shift</h3>

      <form onSubmit={handleAddShift} className="shifts-form">
        {/* Shift Name */}
        <div className="shifts-field">
          <label>Shift Name</label>
          <input
            type="text"
            value={newShift.shiftName}
            onChange={(e) =>
              setNewShift({ ...newShift, shiftName: e.target.value })
            }
            placeholder="Morning / General / Night"
            required
          />
        </div>

        {/* Time */}
        <div className="shifts-time-row">
          <div className="shifts-field">
            <label>Start Time</label>
            <input
              type="time"
              value={newShift.startTime}
              onChange={(e) =>
                setNewShift({ ...newShift, startTime: e.target.value })
              }
              required
            />
          </div>

          <div className="shifts-field">
            <label>End Time</label>
            <input
              type="time"
              value={newShift.endTime}
              onChange={(e) =>
                setNewShift({ ...newShift, endTime: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Grace */}
        <div className="shifts-field">
          <label>Grace Minutes</label>
          <input
            type="number"
            min="0"
            value={newShift.graceMinutes}
            onChange={(e) =>
              setNewShift({
                ...newShift,
                graceMinutes: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Weekly Off */}
        <div className="shifts-weekly">
          <p className="shifts-section-title">Weekly Off</p>

          <label className="shifts-check">
            <input
              type="checkbox"
              checked={newShift.sundayOff}
              onChange={(e) =>
                setNewShift({ ...newShift, sundayOff: e.target.checked })
              }
            />
            <span>Sunday Off</span>
          </label>

          <label className="shifts-check">
            <input
              type="checkbox"
              checked={newShift.allSaturdayOff}
              onChange={(e) =>
                setNewShift({ ...newShift, allSaturdayOff: e.target.checked })
              }
            />
            <span>All Saturdays Off</span>
          </label>

          <label className="shifts-check">
            <input
              type="checkbox"
              checked={newShift.alternateSaturdayOff}
              onChange={(e) =>
                setNewShift({
                  ...newShift,
                  alternateSaturdayOff: e.target.checked,
                })
              }
            />
            <span>Alternate Saturdays Off</span>
          </label>
        </div>

        {/* Actions */}
        <div className="shifts-actions">
          <button
            type="button"
            className="shifts-cancel"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button type="submit" className="shifts-save">
            Save Shift
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Shifts;
