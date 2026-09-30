import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import { useAuth } from "./context/authContext";
import AdminAuthGuard from "./admin/AdminAuthGuard";
import AdminDashboard from "./admin/AdminDashboard";
import Overview from "./admin/components/Overview";
import UsersTable from "./admin/components/UsersTable";
import ActivityLog from "./admin/components/ActivityLog";
import Analytics from "./admin/components/Analytics";

const App = () => {
  const [authUser] = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={authUser ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={
          authUser ? (
            <Navigate
              to={authUser?.user?.role === "admin" ? "/admin" : "/"}
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={authUser ? <Navigate to="/" /> : <Register />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <AdminAuthGuard>
            <AdminDashboard />
          </AdminAuthGuard>
        }
      >
        <Route index element={<Overview />} />
        <Route path="users" element={<UsersTable />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
};

export default App;