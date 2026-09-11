import IngresoAU from "./pages/IngresoAU";
import UniversityPage from "./components/university/UniversityPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/ingreso-a-la-u" element={<IngresoAU />} />
        <Route path="/ingreso-a-la-u/:slug" element={<UniversityPage />} />
        <Route path="/" element={<Home />} />

        <Route path="/noticias/:slug" element={<NewsDetail />} />
        <Route path="/gestion-insignare" element={<AdminLogin />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/gestion-insignare/panel" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
          </AuthProvider>
    </BrowserRouter>
  );
}

export default App;