import { useEffect, useRef, useState } from "react";
import { saveNews, uploadNewsImage, uploadNewsDocument } from "../../services/news";

function NewsForm({ news, onSaved, onCancel }) {
  const [values, setValues] = useState(() => ({
    titulo: news?.titulo || "",
    categoria: news?.categoria || "Admisiones",
    fecha: news?.fecha || new Date().toLocaleDateString("en-CA"),
    imagen: news?.imagen || "",
    documento: news?.documento || "",
    documento_nombre: news?.documento_nombre || "",
    descripcion: news?.descripcion || "",
    contenido: news?.contenido || "",
    activo: news?.activo ?? 1,
  }));
  const [file, setFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const documentRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function chooseImage(event) {
    const selected = event.target.files[0];
    setError("");
    if (!selected) return;
    if (!/\.(jpe?g|png|webp)$/i.test(selected.name) || selected.size > 5 * 1024 * 1024) {
      setError("Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }


  function chooseDocument(event) {
    const selected = event.target.files[0];
    setError("");
    if (!selected) return;
    if (!/\.pdf$/i.test(selected.name) || selected.size > 10 * 1024 * 1024) {
      setError("Selecciona un archivo PDF de hasta 10 MB.");
      event.target.value = "";
      return;
    }
    setDocumentFile(selected);
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const image = file ? (await uploadNewsImage(file)).imagen : values.imagen;
      // Si guardar falla, conserva la imagen ya subida para poder reintentar.
      setValues((current) => ({ ...current, imagen: image }));
      setFile(null);
      setPreview("");
      const uploaded = documentFile ? await uploadNewsDocument(documentFile) : null;
      const document = uploaded ? uploaded.documento : values.documento;
      const documentName = uploaded ? uploaded.documento_nombre : values.documento_nombre;
      setValues((current) => ({ ...current, documento: document, documento_nombre: documentName }));
      setDocumentFile(null);
      const saved = await saveNews({ ...values, imagen: image, documento: document, documento_nombre: documentName, ...(news ? { id: news.id } : {}) });
      onSaved(saved);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-news-form" aria-labelledby="news-form-title">
      <h2 id="news-form-title">{news ? "Editar noticia" : "Nueva noticia"}</h2>
      <form onSubmit={submit} aria-busy={saving}>
        <fieldset disabled={saving}>
          <div className="admin-news-form__grid">
            <div className="admin-news-field">
              <label htmlFor="news-title">Título</label>
              <input ref={titleRef} id="news-title" name="titulo" value={values.titulo} onChange={update} maxLength={250} required />
            </div>
            <div className="admin-news-field">
              <label htmlFor="news-category">Categoría</label>
              <input id="news-category" name="categoria" value={values.categoria} onChange={update} maxLength={100} required />
            </div>
            <div className="admin-news-field">
              <label htmlFor="news-date">Fecha</label>
              <input id="news-date" name="fecha" type="date" value={values.fecha} onChange={update} min="1000-01-01" max="9999-12-31" required />
            </div>
            <div className="admin-news-field">
              <label htmlFor="news-image">Imagen</label>
              <input id="news-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={chooseImage} aria-describedby="news-image-help" />
              <small id="news-image-help">JPG, PNG o WebP. Máximo 5 MB.</small>
              {(preview || values.imagen) && <img className="admin-news-preview" src={preview || values.imagen} alt="Vista previa de la noticia" />}
              {(file || values.imagen) && <button className="admin-news-secondary" type="button" onClick={() => {
                setFile(null); setPreview(""); setValues((current) => ({ ...current, imagen: "" }));
              }}>Quitar imagen</button>}
            </div>
          </div>
          <div className="admin-news-field">

            <label htmlFor="news-document">Documento PDF</label>
            <input ref={documentRef} id="news-document" type="file" accept=".pdf,application/pdf" onChange={chooseDocument} aria-describedby="news-document-help" />
            <small id="news-document-help">PDF. Máximo 10 MB. Los cambios se aplican al guardar la noticia.</small>
            {documentFile ? <p>Seleccionado: {documentFile.name}</p> : values.documento && <p>Documento actual: <a href={values.documento} target="_blank" rel="noopener noreferrer">{values.documento_nombre || "Documento PDF"}</a></p>}
            {(documentFile || values.documento) && <button className="admin-news-secondary" type="button" onClick={() => {
              setDocumentFile(null);
              setValues((current) => ({ ...current, documento: "", documento_nombre: "" }));
              if (documentRef.current) documentRef.current.value = "";
            }}>Quitar documento</button>}
          </div>
          <div className="admin-news-field">
            <label htmlFor="news-description">Descripción</label>
            <textarea id="news-description" name="descripcion" rows="3" value={values.descripcion} onChange={update} maxLength={2000} />
          </div>
          <div className="admin-news-field">
            <label htmlFor="news-content">Contenido</label>
            <textarea id="news-content" name="contenido" rows="7" value={values.contenido} onChange={update} maxLength={10000} />
          </div>
          {news && <label className="admin-news-check"><input type="checkbox" checked={values.activo === 1} onChange={(event) => setValues((current) => ({ ...current, activo: event.target.checked ? 1 : 0 }))} />Visible en el Home</label>}
          {error && <p className="admin-login__error" role="alert">{error}</p>}
          <div className="admin-news-actions">
            <button className="admin-news-primary" type="submit">{saving ? "Guardando..." : "Guardar noticia"}</button>
            <button className="admin-news-secondary" type="button" onClick={onCancel}>Cancelar</button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

export default NewsForm;
