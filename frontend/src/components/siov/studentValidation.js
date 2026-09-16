export function studentError(student = {}) {
 const text = key => String(student[key] ?? "").trim();
 if (!text("nombres")) return { field: "nombres", message: "El nombre y apellido son obligatorios." };
 if (!text("edad")) return { field: "edad", message: "La edad es obligatoria." };
 const age = Number(text("edad"));
 if (!Number.isInteger(age) || age < 10 || age > 99) return { field: "edad", message: "Ingresa una edad válida entre 10 y 99 años." };
 if (!text("institucion")) return { field: "institucion", message: "La institución educativa es obligatoria." };
 if (!["Último Año de Bachillerato", "Graduado"].includes(text("estado"))) return { field: "estado", message: "Selecciona tu estado académico." };
 if (text("correo") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("correo"))) return { field: "correo", message: "Revisa el correo electrónico o deja el campo vacío." };
 return null;
}
