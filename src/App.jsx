import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AddDepartment from "./components/AddDepartment";
import AllEmployee from "./components/AllEmployee";
import AttendanceHistory from "./components/AttendanceHistory";
import ManagerDashboard from "./pages/ManagerDashboard";
import ChangePassword from "./components/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Dashboards (no protection) */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/employeedashboard" element={<EmployeeDashboard />} />
        <Route path="/managerdashboard" element={<ManagerDashboard/>}/>
        <Route path="/addDepartments" element={<AddDepartment />} />
        <Route path="/allemployees" element={<AllEmployee />} />
        <Route path="/employee/attendance" element={<AttendanceHistory />} />
        <Route path="/change-password" element={<ChangePassword/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
