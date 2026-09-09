export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api(path, { method = "GET", body, signal } = {}) {
  const isFormData = body instanceof FormData;
  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(method !== "GET" ? { "X-Requested-With": "XMLHttpRequest", ...(!isFormData ? { "Content-Type": "application/json" } : {}) } : {}),
      },
      ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("No se pudo conectar con el servidor. Inténtalo nuevamente.");
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("El servidor no está disponible o devolvió una respuesta inválida.", response.status);
  }
  if (!response.ok || payload?.success !== true) {
    throw new ApiError(payload?.message || "No se pudo completar la solicitud.", response.status);
  }
  return payload.data;
}
