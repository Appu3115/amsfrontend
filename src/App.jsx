import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AddDepartment from "./components/AddDepartment";
import AllEmployee from "./components/AllEmployee";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards (no protection) */}
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/employeedashboard" element={<EmployeeDashboard />} />

        <Route path="/addDepartments" element={<AddDepartment />} />
        <Route path="/allemployees" element={<AllEmployee />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
