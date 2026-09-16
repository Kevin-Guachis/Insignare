export function reviewError(values, rating = true) {
 if (!values.nombre.trim() || values.nombre.length > 120) return "Escribe tu nombre (máximo 120 caracteres).";
 if (!values.comentario.trim() || values.comentario.length > 2000) return "Escribe un comentario (máximo 2000 caracteres).";
 if (rating && (!Number.isInteger(values.calificacion) || values.calificacion < 1 || values.calificacion > 5)) return "Selecciona una calificación entre 1 y 5 estrellas.";
 return "";
}
