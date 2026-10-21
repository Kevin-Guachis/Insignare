import test from "node:test";
import assert from "node:assert/strict";
import { uploadMaterialPdf, saveMaterialResource } from "../src/services/materialResources.js";
import { uploadPdf } from "../src/services/pdfUpload.js";
const file = new File(["%PDF-1.7"], "scan.pdf", { type: "application/pdf" });
const defaultLimits = { application_max_bytes: 838860800, upload_max_bytes: 838860800, post_max_bytes: 859832320 };

test("subida PDF: límites, progreso, errores y tiempos de espera", async t => {
 const originalFetch = globalThis.fetch;
 const originalXHR = globalThis.XMLHttpRequest;
 let limits = defaultLimits, behavior, instance;
 globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ success: true, data: limits }) });
 globalThis.XMLHttpRequest = class {
  constructor() { this.upload = {}; instance = this; }
  open(method, path) { this.method = method; this.path = path; }
  setRequestHeader() {}
  send() { queueMicrotask(() => behavior(this)); }
  abort() { this.onabort(); this.onloadend(); }
 };
 const finish = (xhr, status, body) => {
  xhr.status = status; xhr.responseText = body; xhr.onload(); xhr.onloadend();
 };
 try {
  await t.test("porcentaje real y respuesta correcta", async () => {
   const progress = [];
   behavior = xhr => {
    xhr.upload.onprogress({ lengthComputable: true, loaded: 1, total: 2 });
    xhr.upload.onload();
    finish(xhr, 200, JSON.stringify({ success: true, data: { documento: "/api/news/document.php?file=test.pdf", documento_nombre: "scan.pdf" } }));
   };
   assert.equal((await uploadMaterialPdf(file, value => progress.push(value))).file_name, "scan.pdf");
   assert.deepEqual(progress, [50, 100]);
   assert.equal(instance.withCredentials, true);
  });
  await t.test("motor compartido para los cuatro endpoints PDF", async () => {
   for (const path of ["/api/material-resources/upload.php", "/api/news/upload_document.php", "/api/academic-offers/upload_document.php", "/api/university-documents/upload.php"]) {
    let checkedPath;
    globalThis.fetch = async url => { checkedPath = url; return { ok: true, status: 200, json: async () => ({ success: true, data: limits }) }; };
    await uploadPdf(path, file);
    assert.equal(checkedPath, path);
    assert.equal(instance.path, path);
    assert.equal(instance.method, "POST");
   }
  });
  await t.test("rechazo previo por límites PHP menores", async () => {
   limits = { ...defaultLimits, upload_max_bytes: 4 };
   await assert.rejects(uploadMaterialPdf(file), /upload_max_filesize/);
   limits = { ...defaultLimits, post_max_bytes: file.size };
   await assert.rejects(uploadMaterialPdf(file), /post_max_size/);
   limits = defaultLimits;
  });
  await t.test("no acepta vacío ni extensión falsa", async () => {
   await assert.rejects(uploadMaterialPdf(new File([], "empty.pdf")), /vacío/);
   await assert.rejects(uploadMaterialPdf(new File(["x"], "fake.php")), /extensión/);
   await assert.rejects(uploadMaterialPdf({ name: "large.pdf", size: 838860801 }), /800 MB/);
  });
  await t.test("conserva error de validación y explica HTTP 413", async () => {
   behavior = xhr => finish(xhr, 422, JSON.stringify({ success: false, message: "PDF truncado" }));
   await assert.rejects(uploadMaterialPdf(file), /PDF truncado/);
   behavior = xhr => finish(xhr, 413, "<html>too large</html>");
   await assert.rejects(uploadMaterialPdf(file), /hosting rechazó/);
  });
  await t.test("timeout de transferencia y de inactividad liberan la promesa", async () => {
   behavior = xhr => { xhr.ontimeout(); xhr.onloadend(); };
   await assert.rejects(uploadMaterialPdf(file), /tiempo máximo/);
   t.mock.timers.enable({ apis: ["setTimeout"] });
   behavior = () => t.mock.timers.tick(120001);
   await assert.rejects(uploadMaterialPdf(file), /dejó de responder/);
   t.mock.timers.reset();
  });
  await t.test("timeout al guardar informa posible guardado previo", async () => {
   const originalTimeout = AbortSignal.timeout;
   AbortSignal.timeout = () => AbortSignal.abort();
   globalThis.fetch = async () => { throw new DOMException("timeout", "TimeoutError"); };
   try { await assert.rejects(saveMaterialResource({ title: "scan" }), /comprobar si se guardó/); }
   finally { AbortSignal.timeout = originalTimeout; }
  });
 } finally {
  globalThis.fetch = originalFetch;
  globalThis.XMLHttpRequest = originalXHR;
 }
});
