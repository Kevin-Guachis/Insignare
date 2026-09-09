import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/admin.css";

// Protección visual únicamente. Cada API administrativa debe utilizar
// backend/middleware/require_admin.php: React no es una barrera de seguridad.
function ProtectedAdminRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) {
    return <main className="admin-login"><p role="status">Comprobando sesión...</p></main>;
  }
  return authenticated ? <Outlet /> : <Navigate to="/gestion-insignare" replace />;
}

export default ProtectedAdminRoute;
