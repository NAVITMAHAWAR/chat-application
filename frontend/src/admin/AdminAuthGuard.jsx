import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AdminAuthGuard = ({ children }) => {
  const [authUser] = useAuth();

  if (!authUser?.user) {
    return <Navigate to="/login" replace />;
  }

  if (authUser.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminAuthGuard;