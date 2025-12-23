import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/authcontext";
<<<<<<< HEAD
import AddDepartment from "./components/AddDepartment";
=======
import AttendanceDashboard from "./pages/AttendanceDashboard";
import AttendancePunchIn from "./components/AttendancePunchIn";
import AttendancePunchOut from "./components/AttendancePunchOut";
import AttendanceList from "./components/AttendanceList";





>>>>>>> 2ad0d2b09c7d70a515a28179fc3c98574a838291

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

         <Route path="/addDepartments" element={<AddDepartment/>}/>
        

          {/* Employee */}
=======
          
          {/* Manager + Employee */}
>>>>>>> 2ad0d2b09c7d70a515a28179fc3c98574a838291
          <Route
            path="/employeedashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD
=======
          {/* <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE","ADMIN"]}>
                <AttendanceDashboard />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/attendance" element={<AttendanceDashboard />} />
        

          {/* <Route
            path="/attendance/punch-in"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <AttendancePunchIn />
              </ProtectedRoute>
            }
          /> */}

           <Route path="/attendance/punch-in" element={<AttendancePunchIn />} />


          {/* <Route
            path="/attendance/punch-out"
            element={ 
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <AttendancePunchOut />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/attendance/punch-out" element={<AttendancePunchOut />} />

          {/* <Route
            path="/attendance/list"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE","ADMIN"]}>
                <AttendanceList />
              </ProtectedRoute>
            }
          /> */}

          <Route path="/attendance/list" element={<AttendanceList />} />

          
>>>>>>> 2ad0d2b09c7d70a515a28179fc3c98574a838291
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
