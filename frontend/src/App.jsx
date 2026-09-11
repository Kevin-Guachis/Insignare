import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import LoadingScreen from "./components/layout/LoadingScreen";

import IngresoAU from "./pages/IngresoAU";
import UniversityPage from "./components/university/UniversityPage";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";


function App() {

  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);


  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);


    return () => clearTimeout(timer);

  }, []);


  return (

    <BrowserRouter>

      <AuthProvider>

        {showLoader && (
          <LoadingScreen
            closing={!loading}
            onFinish={() => setShowLoader(false)}
          />
        )}


        <Routes>

          <Route 
            path="/ingreso-a-la-u" 
            element={<IngresoAU />} 
          />

          <Route 
            path="/ingreso-a-la-u/:slug" 
            element={<UniversityPage />} 
          />

          <Route 
            path="/" 
            element={<Home />} 
          />

          <Route 
            path="/noticias/:slug" 
            element={<NewsDetail />} 
          />

          <Route 
            path="/gestion-insignare" 
            element={<AdminLogin />} 
          />

          <Route element={<ProtectedAdminRoute />}>

            <Route 
              path="/gestion-insignare/panel" 
              element={<AdminDashboard />} 
            />

          </Route>


          <Route 
            path="*" 
            element={<NotFound />} 
          />


        </Routes>


      </AuthProvider>

    </BrowserRouter>

  );
}


export default App;