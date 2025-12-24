import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentWiseAttendance } from "../api/attendanceApi";

import Modal from "../components/Modal";
import AttendancePunchIn from "../components/AttendancePunchIn";
import AttendancePunchOut from "../components/AttendancePunchOut";

import "../styles/Modal.css";
import "../styles/AttendanceDashboard.css";

export default function AttendanceDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");


  const [deptAttendance, setDeptAttendance] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
=======
  const [showPunchIn, setShowPunchIn] = useState(false);
  const [showPunchOut, setShowPunchOut] = useState(false);

>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  // ================================
  // Load department-wise attendance
  // ================================
  const loadDepartmentWiseAttendance = async () => {
<<<<<<< HEAD
    try {
      setLoading(true);

      const res = await getDepartmentWiseAttendance();

      // ✅ Safe response handling
      const data = res?.data?.data || res?.data || [];

      console.log("Department Attendance:", data);
=======
    const res = await getDepartmentWiseAttendance();
    const data = res.data || [];
    setDeptAttendance(data);
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338

    const calculatedSummary = data.reduce(
      (acc, dept) => {
        acc.total += dept.totalEmployees;
        acc.present += dept.presentCount;
        acc.late += dept.lateCount;
        acc.absent += dept.absentCount;
        return acc;
      },
      { total: 0, present: 0, late: 0, absent: 0 }
    );

<<<<<<< HEAD
      // ✅ Safe summary calculation
      const calculatedSummary = data.reduce(
        (acc, dept) => {
          acc.total += dept?.totalEmployees || 0;
          acc.present += dept?.presentCount || 0;
          acc.late += dept?.lateCount || 0;
          acc.absent += dept?.absentCount || 0;
          return acc;
        },
        { total: 0, present: 0, late: 0, absent: 0 }
      );

      setSummary(calculatedSummary);
    } catch (err) {
      console.error("❌ Failed to load department-wise attendance", err);
      setDeptAttendance([]);
      setSummary({ total: 0, present: 0, late: 0, absent: 0 });
    } finally {
      setLoading(false);
    }
=======
    setSummary(calculatedSummary);
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
  };

  useEffect(() => {
    loadDepartmentWiseAttendance();
  }, []);

  return (
    <div className="dashboard">
<<<<<<< HEAD

      {/* ================= HEADER ================= */}
=======
      {/* HEADER */}
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
      <div className="dashboard-header">
        <h1>Attendance Dashboard</h1>
        <span className="subtitle">Today’s overview</span>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="quick-actions">
<<<<<<< HEAD
        <div
          className="action-card"
          onClick={() => navigate("/attendance/punch-in")}
        >
          <h3>Punch In</h3>
          <p>Employee login</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/attendance/punch-out")}
        >
          <h3>Punch Out</h3>
          <p>Employee logout</p>
        </div>

=======
        {role === "EMPLOYEE" && (
        <>
          <div className="action-card" onClick={() => setShowPunchIn(true)}>
            <h3>Punch In</h3>
            <p>Employee login</p>
          </div>

          <div className="action-card" onClick={() => setShowPunchOut(true)}>
            <h3>Punch Out</h3>
            <p>Employee logout</p>
          </div>
        </>
        )}  

        {/*  ATTENDANCE LIST CARD */}
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
        <div
          className="action-card"
          onClick={() => navigate("/attendance/list")}
        >
          <h3>Attendance List</h3>
          <p>View records</p>
        </div>
      </div>

<<<<<<< HEAD
      {/* ================= SUMMARY ================= */}
      <h2 className="section-title">Attendance Summary</h2>

=======
      {/* SUMMARY */}
      <h2>Attendance Dashboard</h2>
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
      <div className="summary-grid">
        <div className="summary-box total">
          <span>Total</span>
          <h2>{summary.total}</h2>
        </div>

        <div className="summary-box present">
          <span>Present</span>
          <h2>{summary.present}</h2>
        </div>

        <div className="summary-box late">
          <span>Late</span>
          <h2>{summary.late}</h2>
        </div>

        <div className="summary-box absent">
          <span>Absent</span>
          <h2>{summary.absent}</h2>
        </div>
      </div>

<<<<<<< HEAD
      {/* ================= DEPARTMENT TABLE ================= */}
      <h2 className="section-title">Department-wise Attendance</h2>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Total</th>
              <th>Present</th>
              <th>Late</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="no-data">
                  Loading attendance...
                </td>
              </tr>
            ) : deptAttendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No data available
                </td>
              </tr>
            ) : (
              deptAttendance.map((d) => (
                <tr key={d.departmentId || d.departmentName}>
                  <td className="dept-name">{d.departmentName}</td>
                  <td>{d.totalEmployees || 0}</td>
                  <td>
                    <span className="badge present">
                      {d.presentCount || 0}
                    </span>
                  </td>
                  <td>
                    <span className="badge late">
                      {d.lateCount || 0}
                    </span>
                  </td>
                  <td>
                    <span className="badge absent">
                      {d.absentCount || 0}
                    </span>
                  </td>
=======
      {/* PUNCH IN MODAL */}
      {role === "EMPLOYEE" && (
      <Modal
        isOpen={showPunchIn}
        onClose={() => setShowPunchIn(false)}
        title="Punch In"
      >
        <AttendancePunchIn onSuccess={() => setShowPunchIn(false)} />
      </Modal>
      )}


      {/* PUNCH OUT MODAL */}
      {role === "EMPLOYEE" && (
      <Modal
        isOpen={showPunchOut}
        onClose={() => setShowPunchOut(false)}
        title="Punch Out"
      >
        <AttendancePunchOut onSuccess={() => setShowPunchOut(false)} />
      </Modal>
      )}

      
      {/* DEPARTMENT WISE ATTENDANCE */}
      <div className="department-section">
        <h2>Department Wise Attendance</h2>

        {deptAttendance.length === 0 ? (
          <p className="empty-text">No attendance data available</p>
        ) : (
          <table className="dept-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {deptAttendance.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.departmentName}</td>
                  <td>{dept.totalEmployees}</td>
                  <td>{dept.presentCount}</td>
                  <td>{dept.lateCount}</td>
                  <td>{dept.absentCount}</td>
>>>>>>> ada8972f11fc311f60f76d120d4d783ae0e81338
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
