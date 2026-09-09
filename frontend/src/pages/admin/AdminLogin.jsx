import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import logo from "../../assets/images/logo-insignare.png";
import "../../styles/admin.css";


function AdminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const loading = auth.loading || submitting;
  const error = submitError || auth.error;
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Acceso administrativo | Instituto Politécnico Insignare";
    return () => { document.title = previousTitle; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setSubmitError("");
    try {
      await auth.login(String(form.get("email")).trim(), String(form.get("password")));
      navigate("/gestion-insignare/panel", { replace: true });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth.loading && auth.authenticated) {
    return <Navigate to="/gestion-insignare/panel" replace />;
  }

  return (
    <main className="admin-login" aria-labelledby="admin-login-title">
      <section className="admin-login__card">
        <img className="admin-login__logo" src={logo} alt="Instituto Politécnico Insignare" width="1460" height="1600" />
        <h1 id="admin-login-title">Acceso administrativo</h1>
        <p className="admin-login__description">Ingresa tus credenciales para continuar.</p>
        <form className="admin-login__form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="admin-login__field">
            <label htmlFor="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="correo@ejemplo.com"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={error ? "admin-login-error" : undefined}
              disabled={loading}
              required
            />
          </div>
          <div className="admin-login__field">
            <label htmlFor="admin-password">Contraseña</label>
            <div className="admin-login__password">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-describedby={error ? "admin-login-error" : undefined}
                disabled={loading}
                required
              />
              <button
                className="admin-login__visibility"
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-controls="admin-password"
                aria-pressed={showPassword}
                disabled={loading}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                  {showPassword && <path d="m4 3 16 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
                </svg>
              </button>
            </div>
          </div>
          {error && <p className="admin-login__error" id="admin-login-error" role="alert">{error}</p>}
          <button className="admin-login__submit" type="submit" disabled={loading}>
            {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
        <Link className="admin-login__back" to="/">Volver al sitio principal</Link>
      </section>
    </main>
  );
}

export default AdminLogin;
