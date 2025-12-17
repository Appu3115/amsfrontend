import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase(); // ✅ normalize user role

  // Role not allowed
  if (
    allowedRoles &&
    !allowedRoles.map(role => role.toUpperCase()).includes(userRole)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
