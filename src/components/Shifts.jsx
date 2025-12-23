import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/Shifts.css";

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newShift, setNewShift] = useState({
    shiftName: "",
    shiftType: "Day",
    startTime: "",
    endTime: "",
  });

  // ================= FETCH SHIFTS =================
  const fetchShifts = async (type = "ALL") => {
    try {
      setLoading(true);
      let res;

      switch (type) {
        case "Day":
          res = await api.get("/shift/getDayShifts");
          break;
        case "Night":
          res = await api.get("/shift/getNightShifts");
          break;
        case "Evening":
          res = await api.get("/shift/getEveningShifts");
          break;
        default:
          res = await api.get("/shift/getAllShift");
      }

      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts(filter);
  }, [filter]);

  // ================= ADD SHIFT =================
  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shift/addShift", newShift);
      fetchShifts(filter);
      setShowModal(false);
      setNewShift({
        shiftName: "",
        shiftType: "Day",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error("Error adding shift", err);
    }
  };

  return (
    <div className="shift-container">
      {/* ===== HEADER ===== */}
      <div className="shift-header">
        <div>
          <h2>Shift Management</h2>
          <p>Create and manage work shifts</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Shift
        </button>
      </div>

      {/* ===== FILTER ===== */}
      <div className="filter-row">
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

      {/* ===== SHIFT LIST ===== */}
      <div className="shift-list">
        {loading ? (
          <p className="loading">Loading shifts...</p>
        ) : shifts.length === 0 ? (
          <p className="empty">No shifts found</p>
        ) : (
          shifts.map((shift) => (
            <div className="shift-item" key={shift.id}>
              <div>
                <h4>{shift.shiftName}</h4>
                <span className={`badge ${shift.shiftType.toLowerCase()}`}>
                  {shift.shiftType}
                </span>
              </div>
              <p>
                {shift.startTime} – {shift.endTime}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ===== ADD SHIFT MODAL ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Shift</h3>

            <form onSubmit={handleAddShift}>
              <input
                type="text"
                placeholder="Shift Name"
                value={newShift.shiftName}
                onChange={(e) =>
                  setNewShift({ ...newShift, shiftName: e.target.value })
                }
                required
              />

              <select
                value={newShift.shiftType}
                onChange={(e) =>
                  setNewShift({ ...newShift, shiftType: e.target.value })
                }
              >
                <option value="Day">Day</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>

              <div className="time-row">
                <input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) =>
                    setNewShift({ ...newShift, startTime: e.target.value })
                  }
                  required
                />
                <input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) =>
                    setNewShift({ ...newShift, endTime: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
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
