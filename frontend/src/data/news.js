export function toNewsStory(row) {
  const university = row.titulo.match(/\b(UCE|EPN|ESPE)\b/i)?.[1]?.toUpperCase() || "IP";
  const date = new Date(row.fecha + "T12:00:00");
  const month = new Intl.DateTimeFormat("es-EC", { month: "long" }).format(date);
  return {
    id: row.id,
    slug: row.slug,
    title: row.titulo,
    category: row.categoria,
    date: row.fecha,
    dateLabel: `${month} ${date.getDate()}, ${date.getFullYear()}`,
    image: row.imagen,
    excerpt: row.descripcion,
    content: row.contenido ? row.contenido.split(/\r?\n\s*\r?\n/).filter(Boolean) : [],
    university,
    attachments: row.documento ? [{ name: row.documento_nombre || "Documento PDF", url: row.documento, type: "pdf" }] : [],
  };
}

export const getNewsPath = (story) => `/noticias/${story.slug}`;
