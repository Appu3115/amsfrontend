// 🔑 Session storage keys
const ADMIN_KEY = "user_admin";
const MANAGER_KEY = "user_manager";
const EMPLOYEE_KEY = "user_employee";

/**
 * 🔐 Get logged-in user (ADMIN / MANAGER / EMPLOYEE)
 */
export const getUser = () => {
  const admin = sessionStorage.getItem(ADMIN_KEY);
  if (admin) return JSON.parse(admin);

  const manager = sessionStorage.getItem(MANAGER_KEY);
  if (manager) return JSON.parse(manager);

  const employee = sessionStorage.getItem(EMPLOYEE_KEY);
  if (employee) return JSON.parse(employee);

  return null;
};

/**
 * 🏷️ Get logged-in role
 */
export const getRole = () => {
  if (sessionStorage.getItem(ADMIN_KEY)) return "ADMIN";
  if (sessionStorage.getItem(MANAGER_KEY)) return "MANAGER";
  if (sessionStorage.getItem(EMPLOYEE_KEY)) return "EMPLOYEE";
  return null;
};

/**
 * ✅ Authentication check
 */
export const isAuthenticated = () => {
  return !!getUser();
};

/**
 * 🔒 Role-based check
 */
export const hasRole = (requiredRole) => {
  return getRole() === requiredRole;
};

/**
 * 💾 Save user after login (BEST PRACTICE)
 */
export const saveUserSession = (user) => {
  if (!user || !user.role) return;

  const roleKey = user.role.toLowerCase();

  sessionStorage.setItem(
    `user_${roleKey}`,
    JSON.stringify(user)
  );
};

/**
 * 🔄 Update user session (e.g., after password change)
 */
export const updateUserSession = (updatedUser) => {
  if (!updatedUser || !updatedUser.role) return;

  const roleKey = updatedUser.role.toLowerCase();

  sessionStorage.setItem(
    `user_${roleKey}`,
    JSON.stringify(updatedUser)
  );
};

/**
 * 🚪 Logout (clear all roles safely)
 */
export const logout = (navigate) => {
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(MANAGER_KEY);
  sessionStorage.removeItem(EMPLOYEE_KEY);
  navigate("/login", { replace: true });
};
