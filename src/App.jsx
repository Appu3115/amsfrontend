import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/authcontext";

import AddDepartment from "./components/AddDepartment";

import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendancePunchIn from "./components/AttendancePunchIn";
import AttendancePunchOut from "./components/AttendancePunchOut";
import AttendanceList from "./components/AttendanceList";



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


         <Route path="/addDepartments" element={<AddDepartment/>}/>
        


          <Route
            path="/employeedashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />


       

          <Route path="/attendancedashboard" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AttendanceDashboard /> 
              </ProtectedRoute>
              } 
              />
        

       

           <Route path="/attendance/punch-in" element={<AttendancePunchIn />} />



          <Route path="/attendance/punch-out" element={<AttendancePunchOut />} />

        

          <Route path="/attendance/list" element={<AttendanceList />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
