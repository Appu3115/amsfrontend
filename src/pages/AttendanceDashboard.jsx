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
  const [showPunchIn, setShowPunchIn] = useState(false);
  const [showPunchOut, setShowPunchOut] = useState(false);

  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  useEffect(() => {
    loadDepartmentWiseAttendance();
  }, []);

  const loadDepartmentWiseAttendance = async () => {
    const res = await getDepartmentWiseAttendance();
    const data = res.data || [];
    setDeptAttendance(data);

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

    setSummary(calculatedSummary);
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Attendance Dashboard</h1>
        <span className="subtitle">Today’s overview</span>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
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
        <div
          className="action-card"
          onClick={() => navigate("/attendance/list")}
        >
          <h3>Attendance List</h3>
          <p>View records</p>
        </div>
      </div>

      {/* SUMMARY */}
      <h2>Attendance Dashboard</h2>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
