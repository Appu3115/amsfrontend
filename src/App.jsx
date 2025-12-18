import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/authcontext";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import AttendanceList from "./pages/attendance/AttendanceList";




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin only */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD
          <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
          <Route path="/attendance/list" element={<AttendanceList />} />
=======

          {/* Manager + Employee */}
          <Route
            path="/employeedashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
>>>>>>> ed36aada56f47c7c5ef4544d895e8acf6fc9e1a9
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
