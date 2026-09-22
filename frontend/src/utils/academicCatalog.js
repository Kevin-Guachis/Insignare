export const normalizeAcademicSearch = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function filterAcademicCatalog(faculties, query) {
 const term = normalizeAcademicSearch(query);
 if (!term) return faculties;
 return faculties.map(faculty => ({
  ...faculty,
  careers: faculty.careers.filter(career =>
   normalizeAcademicSearch(career.nombre).includes(term) ||
   career.subjects.some(subject => normalizeAcademicSearch(subject.nombre).includes(term))
  ),
 })).filter(faculty => faculty.careers.length > 0);
}
