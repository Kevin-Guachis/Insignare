import { useEffect, useState } from "react";
import { api } from "../services/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api("/api/auth/session.php", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setAdmin(data.authenticated ? data.admin : null);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function refreshSession() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/session.php");
      setAdmin(data.authenticated ? data.admin : null);
      return data;
    } catch (error) {
      setAdmin(null);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const data = await api("/api/auth/login.php", { method: "POST", body: { email, password } });
    setAdmin(data.admin);
    setError("");
    return data.admin;
  }

  async function logout() {
    await api("/api/auth/logout.php", { method: "POST", body: {} });
    setAdmin(null);
    setError("");
  }

  return (
    <AuthContext.Provider value={{ admin, authenticated: admin !== null, loading, error, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
