import { api, ApiError } from "./api.js";
export async function savePdfResource(path, options) {
 const signal = AbortSignal.timeout(60000);
 try { return await api(path, { ...options, signal }); }
 catch (error) {
  if (signal.aborted) throw new ApiError("El servidor tardó demasiado en guardar el recurso. Actualiza los datos para comprobar si se guardó antes de reintentar.");
  throw error;
 }
}
export async function uploadPdf(path, file, onProgress) {
 let limits;
 const limitsSignal = AbortSignal.timeout(15000);
 try {
  limits = await api(path, { signal: limitsSignal });
 } catch (error) {
  if (limitsSignal.aborted) throw new ApiError("El servidor no respondió al comprobar los límites de subida. Inténtalo nuevamente.");
  throw error;
 }
 const mb = bytes => `${Number((bytes / 1048576).toFixed(2))} MB`;
 if (!/\.pdf$/i.test(file.name)) throw new ApiError("La extensión del archivo debe ser .pdf.");
 if (!file.size) throw new ApiError("El PDF está vacío.");
 if (file.size > limits.application_max_bytes) throw new ApiError("El PDF no debe superar 800 MB.");
 if (limits.upload_max_bytes > 0 && file.size > limits.upload_max_bytes) throw new ApiError(`El servidor admite archivos de hasta ${mb(limits.upload_max_bytes)} (upload_max_filesize). Máximo de la aplicación: 800 MB.`);
 if (limits.post_max_bytes > 0 && file.size >= limits.post_max_bytes) throw new ApiError(`La petición debe ser menor de ${mb(limits.post_max_bytes)} (post_max_size), incluido el formulario. Elige un PDF menor o ajusta el hosting.`);
 const body = new FormData(); body.append("documento", file);
 const row = await new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", path);
  xhr.withCredentials = true;
  xhr.timeout = 3600000;
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  let watchdog;
  const armWatchdog = milliseconds => {
   clearTimeout(watchdog);
   watchdog = setTimeout(() => {
    reject(new ApiError("El servidor dejó de responder durante la subida o validación. Comprueba la conexión y vuelve a intentarlo."));
    xhr.abort();
   }, milliseconds);
  };
  xhr.upload.onprogress = event => {
   armWatchdog(120000);
   if (event.lengthComputable) onProgress?.(Math.min(100, Math.round(event.loaded / event.total * 100)));
  };
  xhr.upload.onload = () => { armWatchdog(300000); onProgress?.(100); };
  xhr.onloadend = () => clearTimeout(watchdog);
  xhr.ontimeout = () => reject(new ApiError("La subida superó el tiempo máximo. Inténtalo nuevamente con una conexión estable."));
  xhr.onerror = () => reject(new ApiError("Se interrumpió la conexión durante la subida. Inténtalo nuevamente."));
  xhr.onabort = () => reject(new ApiError("La subida fue cancelada."));
  xhr.onload = () => {
   let payload;
   try { payload = JSON.parse(xhr.responseText); }
   catch { reject(new ApiError(xhr.status === 413 ? "El hosting rechazó el tamaño de la petición antes de llegar a PHP. Comprueba su límite HTTP, upload_max_filesize y post_max_size." : "El servidor devolvió una respuesta inválida al subir el PDF.", xhr.status)); return; }
   if (xhr.status < 200 || xhr.status >= 300 || payload?.success !== true) {
    reject(new ApiError(payload?.message || "No se pudo subir el PDF.", xhr.status)); return;
   }
   resolve(payload.data);
  };
  armWatchdog(120000);
  try { xhr.send(body); } catch (error) { clearTimeout(watchdog); reject(error); }
 });
 return row;
}
