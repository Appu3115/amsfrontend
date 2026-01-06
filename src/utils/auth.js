const ADMIN_KEY = "user_admin";
const EMPLOYEE_KEY = "user_employee";

/**
 * 🔐 Get logged-in user (admin or employee)
 */
export const getUser = () => {
  const admin = sessionStorage.getItem(ADMIN_KEY);
  if (admin) return JSON.parse(admin);

  const employee = sessionStorage.getItem(EMPLOYEE_KEY);
  if (employee) return JSON.parse(employee);

  return null;
};

/**
 * 🔑 Get role from key existence
 */
export const getRole = () => {
  if (sessionStorage.getItem(ADMIN_KEY)) return "ADMIN";
  if (sessionStorage.getItem(EMPLOYEE_KEY)) return "EMPLOYEE";
  return null;
};

/**
 * ✅ Auth check
 */
export const isAuthenticated = () => {
  return !!getUser();
};

/**
 * 🚪 Logout everywhere safely
 */
export const logout = (navigate) => {
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(EMPLOYEE_KEY);
  navigate("/login", { replace: true });
};
