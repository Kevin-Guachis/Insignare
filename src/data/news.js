import uceImage from "../assets/images/news/admision-uce.jpg";
import epnImage from "../assets/images/news/admision-epn.webp";
import espeImage from "../assets/images/news/admision-espe.jpg";

const AUTHOR = "instituto.politecnico.insignare@gmail.com";

// Fuente única. Imágenes y documentos proceden de las publicaciones originales.
// Los componentes reciben estos registros; no dependen del futuro proveedor de datos.
export const news = [
  {
    id: "uce", slug: "admision-uce", title: "ADMISIÓN UCE",
    category: "Admisiones", university: "UCE",
    excerpt: "Información del examen de admisión de Artes 2026–2027.",
    content: ["INFORMACIÓN EXAMEN ADMISIÓN ARTES 2026–2027"],
    date: "2026-07-31", dateLabel: "julio 31, 2026", author: AUTHOR,
    image: uceImage, featured: true, topStory: true,
    attachments: [
      { name: "Información examen admisión Artes 2026–2027", url: "/documents/uce-admision-artes-2026-2027.pdf", type: "pdf" },
    ],
  },
  {
    id: "epn", slug: "admision-epn", title: "ADMISIÓN EPN",
    category: "Admisiones", university: "EPN",
    excerpt: "Lineamientos para la admisión EPN y guía de estudio.",
    content: ["LINEAMIENTOS PARA LA ADMISIÓN EPN", "GUÍA DE ESTUDIO EPN"],
    date: "2026-06-22", dateLabel: "junio 22, 2026", author: AUTHOR,
    image: epnImage, featured: true, topStory: true,
    attachments: [
      { name: "Lineamientos para la admisión EPN", url: "/documents/epn-lineamientos-admision.pdf", type: "pdf" },
      { name: "Guía de estudio EPN 2026", url: "/documents/epn-guia-estudio-2026.pdf", type: "pdf" },
    ],
  },
  {
    id: "espe", slug: "admision-espe", title: "ADMISIÓN ESPE",
    category: "Admisiones", university: "ESPE",
    excerpt: "Información de admisión ESPE.",
    content: [],
    date: "2026-06-22", dateLabel: "junio 22, 2026", author: AUTHOR,
    image: espeImage, featured: true, topStory: true, attachments: [],
  },
];

export const topStories = news.filter((story) => story.topStory);
export const featuredNews = news.filter((story) => story.featured);
export const getNewsPath = (story) => `/noticias/${story.slug}`;
