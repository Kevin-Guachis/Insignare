import test from "node:test";
import assert from "node:assert/strict";
import { filterAcademicCatalog } from "../src/utils/academicCatalog.js";

const faculties = [
 { id: 1, nombre: "Ciencias médicas", careers: [
  { id: 1, nombre: "Medicina", subjects: [{ id: 1, nombre: "Biología Humana" }, { id: 2, nombre: "Química" }] },
  { id: 2, nombre: "Enfermería", subjects: [] },
 ] },
 { id: 2, nombre: "Ingeniería", careers: [{ id: 3, nombre: "Civil", subjects: [{ id: 3, nombre: "Matemática" }] }] },
 { id: 3, nombre: "Sin carreras", careers: [] },
];

test("empty searches preserve all faculties and their order", () => {
 assert.equal(filterAcademicCatalog(faculties, "  "), faculties);
});
test("career search ignores case, whitespace and accents", () => {
 const result = filterAcademicCatalog(faculties, "  ENFERMERIA  ");
 assert.deepEqual(result.map(faculty => faculty.id), [1]);
 assert.deepEqual(result[0].careers.map(career => career.id), [2]);
});
test("subject matches keep the career's subjects without changing source data", () => {
 const before = structuredClone(faculties);
 const result = filterAcademicCatalog(faculties, "biologia");
 assert.deepEqual(result[0].careers.map(career => career.id), [1]);
 assert.equal(result[0].careers[0].subjects.length, 2);
 assert.deepEqual(faculties, before);
});
test("unmatched input and markup remain plain search text", () => {
 assert.deepEqual(filterAcademicCatalog(faculties, "no existe"), []);
 assert.deepEqual(filterAcademicCatalog(faculties, "<script>"), []);
});
