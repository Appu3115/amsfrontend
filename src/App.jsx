import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/authcontext";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import AttendanceList from "./pages/attendance/AttendanceList";




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
          <Route path="/attendance/list" element={<AttendanceList />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
