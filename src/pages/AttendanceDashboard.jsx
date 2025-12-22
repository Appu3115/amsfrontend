

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartmentWiseAttendance } from "../api/attendanceApi";
import "../styles/AttendanceDashboard.css";



export default function AttendanceDashboard() {
  const navigate = useNavigate();

  const [deptAttendance, setDeptAttendance] = useState([]);
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
    try {
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
    } catch (err) {
      console.error("Failed to load department-wise attendance");
    }
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
        <div className="action-card" onClick={() => navigate("/attendance/punch-in")}>
          <h3>Punch In</h3>
          <p>Employee login</p>
        </div>

        <div className="action-card" onClick={() => navigate("/attendance/punch-out")}>
          <h3>Punch Out</h3>
          <p>Employee logout</p>
        </div>

        <div className="action-card" onClick={() => navigate("/attendance/list")}>
          <h3>Attendance List</h3>
          <p>View records</p>
        </div>
      </div>

      {/* SUMMARY */}
      <h2 className="section-title">Attendance Summary</h2>

      <div className="summary-grid">
        <div className="summary-box total">
          <span>Total Employees</span>
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

      {/* DEPARTMENT TABLE */}
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
            {deptAttendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No data available</td>
              </tr>
            ) : (
              deptAttendance.map((d, i) => (
                <tr key={i}>
                  <td className="dept-name">{d.departmentName}</td>
                  <td>{d.totalEmployees}</td>
                  <td><span className="badge present">{d.presentCount}</span></td>
                  <td><span className="badge late">{d.lateCount}</span></td>
                  <td><span className="badge absent">{d.absentCount}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
