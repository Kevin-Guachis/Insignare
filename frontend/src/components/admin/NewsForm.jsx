import { imageSize } from "../../services/api";
import { showError, showWarning } from "../../utils/alerts";
import { useEffect, useRef, useState } from "react";
import { saveNews, uploadNewsImage, uploadNewsDocument } from "../../services/news";
import { ContentImage } from "../university/GallerySection";

function NewsForm({ news, onSaved, onCancel }) {
  const [values, setValues] = useState(() => ({
    titulo: news?.titulo || "",
    categoria: news?.categoria || "Admisiones",
    fecha: news?.fecha || new Date().toLocaleDateString("en-CA"),
    imagen: news?.imagen || "",
    tamano_imagen: imageSize(news?.tamano_imagen),
    documento: news?.documento || "",
    documento_nombre: news?.documento_nombre || "",
    descripcion: news?.descripcion || "",
    contenido: news?.contenido || "",
    activo: news?.activo ?? 1,
  }));
  const [file, setFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const documentRef = useRef(null);
  const imageRef = useRef(null);
  const imageKey = useRef(0);
  const [additionalImages, setAdditionalImages] = useState(() => (news?.additional_images ?? []).map(image => ({ ...image, key: `saved-${image.id}` })));
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function chooseImage(event) {
    const selected = event.target.files[0];

    if (!selected) return;
    if (!/\.(jpe?g|png|webp)$/i.test(selected.name) || selected.size > 5 * 1024 * 1024) {
      showWarning("Archivo inválido", "Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  function chooseAdditionalImages(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (additionalImages.length + files.length > 5) {
      showWarning("Límite de imágenes", "Puedes agregar hasta 5 imágenes adicionales en total, incluidas las guardadas.");
      return;
    }
    if (files.some(image => !/\.(jpe?g|png|webp)$/i.test(image.name) || image.size > 5 * 1024 * 1024 || !image.size)) {
      showWarning("Archivo inválido", "Selecciona imágenes JPG, PNG o WebP de hasta 5 MB cada una.");
      return;
    }
    setAdditionalImages(current => [...current, ...files.map(file => ({ key: `new-${++imageKey.current}`, file }))]);
  }

  function chooseDocument(event) {
    const selected = event.target.files[0];

    if (!selected) return;
    if (!/\.pdf$/i.test(selected.name) || selected.size > 800 * 1024 * 1024) {
      showWarning("Archivo inválido", "Selecciona un archivo PDF de hasta 800 MB.");
      event.target.value = "";
      return;
    }
    setDocumentFile(selected);
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const image = file ? (await uploadNewsImage(file)).imagen : values.imagen;
      // Si guardar falla, conserva la imagen ya subida para poder reintentar.
      setValues((current) => ({ ...current, imagen: image }));
      setFile(null);
      if (imageRef.current) imageRef.current.value = "";
      const additional = [];
      for (const item of additionalImages) {
        const uploaded = item.file ? (await uploadNewsImage(item.file, true)).imagen : item.imagen;
        additional.push(item.id ? { id: item.id } : { imagen: uploaded });
        // Conservar cada subida completada si una posterior o el guardado falla.
        if (item.file) setAdditionalImages(current => current.map(image => image.key === item.key ? { ...image, imagen: uploaded, file: null } : image));
      }
      const uploaded = documentFile ? await uploadNewsDocument(documentFile) : null;
      const document = uploaded ? uploaded.documento : values.documento;
      const documentName = uploaded ? uploaded.documento_nombre : values.documento_nombre;
      setValues((current) => ({ ...current, documento: document, documento_nombre: documentName }));
      setDocumentFile(null);
      const saved = await saveNews({ ...values, imagen: image, additional_images: additional, documento: document, documento_nombre: documentName, ...(news ? { id: news.id } : {}) });
      onSaved(saved);
    } catch(error){showError(error.message);
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
              <label htmlFor="news-image-size">Tamaño de imagen</label>
              <input id="news-image-size" type="range" min="25" max="100" step="1" value={values.tamano_imagen} aria-valuetext={`${values.tamano_imagen}%`} onChange={e=>setValues({...values,tamano_imagen:imageSize(e.target.value)})}/><output htmlFor="news-image-size">{values.tamano_imagen}%</output>
              <label htmlFor="news-image">Imagen</label>
              <input ref={imageRef} id="news-image" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={chooseImage} aria-describedby="news-image-help" />
              <small id="news-image-help">JPG, PNG o WebP. Máximo 5 MB.</small>
              {values.imagen && <><small>Imagen guardada</small><ContentImage className="admin-news-preview" src={values.imagen} alt="Imagen principal actual" /></>}
              {file && <><small>Nueva imagen seleccionada</small><ContentImage className="admin-news-preview" file={file} alt="Nueva imagen principal" /><button className="admin-news-secondary" type="button" onClick={() => { setFile(null); imageRef.current.value = ""; }}>Cancelar selección</button></>}
              {(file || values.imagen) && <button className="admin-news-secondary" type="button" onClick={() => {
                setFile(null); imageRef.current.value = ""; setValues((current) => ({ ...current, imagen: "" }));
              }}>Quitar imagen</button>}
            </div>
          </div>
          <section className="admin-news-field" aria-labelledby="news-additional-heading">
            <h3 id="news-additional-heading">Imágenes adicionales</h3>
            <label htmlFor="news-additional-images">Seleccionar imágenes</label>
            <input id="news-additional-images" type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={chooseAdditionalImages} aria-describedby="news-additional-help" />
            <small id="news-additional-help">Puedes agregar hasta 5 imágenes adicionales. JPG, PNG o WebP, máximo 5 MB cada una. {additionalImages.length}/5 seleccionadas. Los cambios se aplican al guardar.</small>
            {additionalImages.length > 0 && <div className="news-additional-images">
              {additionalImages.map((image, index) => <div key={image.key}>
                <p>{image.id ? "Imagen guardada" : "Nueva imagen"} {index + 1}</p>
                <ContentImage className="admin-news-preview" src={image.imagen} file={image.file} alt={`Imagen adicional ${index + 1}`} />
                <button className="admin-news-secondary" type="button" aria-label={`Quitar imagen adicional ${index + 1}`} onClick={() => setAdditionalImages(current => current.filter(item => item.key !== image.key))}>Quitar imagen</button>
              </div>)}
            </div>}
          </section>
          <div className="admin-news-field">

            <label htmlFor="news-document">Documento PDF</label>
            <input ref={documentRef} id="news-document" type="file" accept=".pdf,application/pdf" onChange={chooseDocument} aria-describedby="news-document-help" />
            <small id="news-document-help">PDF. Máximo 800 MB. Los cambios se aplican al guardar la noticia.</small>
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
