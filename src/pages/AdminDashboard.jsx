import useAuth from "../auth/useAuth";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <h1>Welcome {user.firstName}</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
};

export default AdminDashboard;
