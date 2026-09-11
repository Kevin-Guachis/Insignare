import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; import { AuthProvider } from "./context/AuthContext";
import LoadingScreen from "./components/layout/LoadingScreen";
//import PageTransition from "./components/layout/PageTransition";
import IngresoAU from "./pages/IngresoAU";
import UniversityPage from "./components/university/UniversityPage";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";

function AnimatedRoutes() {

  const location = useLocation();

  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitioning, setTransitioning] = useState(false);


  useEffect(() => {

    if (location !== displayLocation) {

      setTransitioning(true);


      const timer = setTimeout(() => {

        setDisplayLocation(location);

        window.scrollTo({
          top: 0,
          behavior: "instant"
        });


        setTimeout(() => {
          setTransitioning(false);
        }, 100);


      }, 600);


      return () => clearTimeout(timer);

    }


  }, [location, displayLocation]);


  return (

    <>

      <div
        className={
          transitioning
            ? "page-transition-overlay active"
            : "page-transition-overlay"
        }
      />


      <div className="page-transition-initial">

        <Routes location={displayLocation}>

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
      </div>
    </>
  );
}

function App() {

  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [showApp, setShowApp] = useState(false);

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
            onFinish={() => {
              setShowLoader(false);

              setTimeout(() => {
                setShowApp(true);
              }, 100);
            }}
          />
        )}


        {showApp && (
          <AnimatedRoutes />
        )}


      </AuthProvider>

    </BrowserRouter>

  );
}


export default App;