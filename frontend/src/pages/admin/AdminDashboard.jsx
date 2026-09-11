import UniversitiesAdmin from "../../components/admin/UniversitiesAdmin";
import FooterServices from "../../components/admin/FooterServices";
import "bootstrap-icons/font/bootstrap-icons.css";
import SiteSettingsForm from "../../components/admin/SiteSettingsForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { listAdminNews, hideNews, notifyNewsChanged, destroyNews, saveNews } from "../../services/news";
import NewsForm from "../../components/admin/NewsForm";
import "../../styles/admin.css";
import "../../styles/admin-news.css";

const sections = [{ id: "home", label: "Home" }, { id: "footer", label: "Footer" }, { id: "universities", label: "Universidades" }];

function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("home");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null);
  const [confirmHide, setConfirmHide] = useState(null);

  useEffect(() => {
    let active = true;
    listAdminNews().then((data) => { if (active) setRows(data); })
      .catch((error) => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function reload() {
    setLoading(true);
    setError("");
    try { setRows(await listAdminNews()); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }

  function saved(row) {
    setRows((current) => [row, ...current.filter((item) => item.id !== row.id)]);
    setEditor(null);
    setMessage("Noticia guardada correctamente.");
    setError("");
    notifyNewsChanged();
  }

  async function hide() {
    setBusy(true);
    setError("");
    try {
      await hideNews(confirmHide.id);
      setRows((current) => current.map((row) => row.id === confirmHide.id ? { ...row, activo: 0 } : row));
      setMessage("Noticia oculta. Se conserva en el historial.");
      setConfirmHide(null);
      notifyNewsChanged();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }


  async function remove() {
    setBusy(true); setError("");
    try {
      await destroyNews(confirmDelete.id);
      setRows(current => current.filter(row => row.id !== confirmDelete.id));
      setConfirmDelete(null);
      setMessage("Noticia eliminada definitivamente.");
      notifyNewsChanged();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  async function restore(row) {
    setBusy(true); setError("");
    try {
      const restored = await saveNews({ ...row, activo: 1 });
      setRows(current => current.map(item => item.id === row.id ? restored : item));
      setMessage("Noticia restaurada.");
      notifyNewsChanged();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try { await logout(); navigate("/gestion-insignare", { replace: true }); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="admin-news">
      <div className="admin-news__container">
        <header className="admin-news__header">
          <div><h1>Panel administrativo</h1><p>Bienvenido, {admin.name}</p></div>
          <button className="admin-news-secondary" type="button" disabled={busy} onClick={handleLogout}>Cerrar sesión</button>
        </header>

        <nav className="admin-sections" aria-label="Secciones del panel">
          {sections.map(item => <button key={item.id} type="button" className={section === item.id ? "admin-news-primary" : "admin-news-secondary"} aria-pressed={section === item.id} aria-controls={"panel-" + item.id} onClick={() => setSection(item.id)}>{item.label}</button>)}
        </nav>
        <section id="panel-home" hidden={section !== "home"} className="admin-news__card">
          <div className="admin-news__toolbar">
            <h2>Noticias del Home</h2>
            <button className="admin-news-primary" type="button" disabled={!!editor || busy} onClick={() => { setEditor({ mode: "create" }); setConfirmDelete(null); setMessage(""); setConfirmHide(null); }}>Nueva noticia</button>
          </div>
          {message && <p className="admin-news-message" role="status">{message}</p>}
          {error && <div role="alert"><p className="admin-login__error">{error}</p><button className="admin-news-secondary" type="button" onClick={reload}>Reintentar</button></div>}

          {confirmDelete && <div className="admin-news-confirm" role="alert">
            <p>¿Está seguro que desea eliminar esta noticia?</p>
            <p>{confirmDelete.titulo}</p>
            <div className="admin-news-actions">
              <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button type="button" className="admin-news-primary" disabled={busy} onClick={remove}>Eliminar</button>
            </div>
          </div>}
          {editor ? <NewsForm key={editor.news?.id || "new"} news={editor.news} onSaved={saved} onCancel={() => setEditor(null)} /> : (
            <>
              {confirmHide && (
                <div className="admin-news-confirm" role="alert">
                  <p>¿Ocultar “{confirmHide.titulo}” del Home?</p>
                  <div className="admin-news-actions">
                    <button type="button" className="admin-news-primary" disabled={busy} onClick={hide}>Confirmar ocultar</button>
                    <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => setConfirmHide(null)}>Cancelar</button>
                  </div>
                </div>
              )}
              {loading ? <p role="status">Cargando noticias...</p> : (
                <div className="admin-news-table-wrapper">
                  <table className="admin-news-table">
                    <thead><tr><th>Imagen</th><th>Título</th><th>Categoría</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td data-label="Imagen">{row.imagen ? <img src={row.imagen} alt="" width="56" height="56" /> : "—"}</td>
                          <td data-label="Título">{row.titulo}</td><td data-label="Categoría">{row.categoria}</td><td data-label="Fecha"><time dateTime={row.fecha}>{row.fecha}</time></td>
                          <td data-label="Estado"><span className={row.activo ? "admin-news-status" : "admin-news-status admin-news-status--hidden"}>{row.activo ? "Visible" : "Oculta"}</span></td>
                          <td data-label="Acciones"><div className="admin-news-actions">
                            <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => { setEditor({ news: row }); setConfirmDelete(null); setMessage(""); setConfirmHide(null); }} title="Editar noticia" aria-label="Editar noticia"><i className="bi bi-pencil" aria-hidden="true" /></button>
                            {row.activo === 1 && <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => { setConfirmDelete(null); setConfirmHide(row); }} title="Ocultar noticia" aria-label="Ocultar noticia"><i className="bi bi-eye" aria-hidden="true" /></button>}

                            {row.activo === 0 && <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => restore(row)} title="Mostrar noticia" aria-label="Mostrar noticia"><i className="bi bi-eye" aria-hidden="true" /></button>}
                            <button type="button" className="admin-news-secondary" disabled={busy} onClick={() => { setConfirmHide(null); setConfirmDelete(row); setMessage(""); }} title="Eliminar noticia" aria-label="Eliminar noticia"><i className="bi bi-trash" aria-hidden="true" /></button>
                          </div></td>
                        </tr>
                      ))}
                      {!rows.length && <tr><td colSpan="6">No hay noticias. Crea la primera con “Nueva noticia”.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
        <div id="panel-universities" hidden={section !== "universities"}><UniversitiesAdmin /></div>
        <div id="panel-footer" hidden={section !== "footer"}><SiteSettingsForm /><FooterServices /></div>
      </div>
    </main>
  );
}

export default AdminDashboard;
