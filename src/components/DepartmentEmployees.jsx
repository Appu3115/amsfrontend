import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/DepartmentEmployees.css";

const DepartmentEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const managerData = sessionStorage.getItem("user_manager");
      const manager = managerData ? JSON.parse(managerData) : null;

      if (!manager?.employeeId) return;

      const res = await api.get("/user/employees", {
        headers: { employeeId: manager.employeeId },
      });

      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="table-loader">Loading employees...</div>;

  return (
    <div className="dept-table-wrapper">
      <div className="dept-table-header">
        <h3>Department Employees</h3>
        <span className="count-pill">{employees.length}</span>
      </div>

      <div className="table-container">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Shift</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td>{emp.employeeId}</td>
                <td>{emp.firstName} {emp.lastName}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>

                <td>
                  <span className={`status-pill ${emp.status.toLowerCase()}`}>
                    {emp.status}
                  </span>
                </td>

                <td>
                  {emp.shift.shiftName}
                  <div className="shift-time">
                    {formatTime12Hour(emp.shift.startTime)} - {formatTime12Hour(emp.shift.endTime)}
                  </div>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 const formatTime12Hour = (time) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };
export default DepartmentEmployees;
