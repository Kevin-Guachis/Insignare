// Requires PHP/Vite and a headless Chromium browser with remote debugging enabled.
// node frontend/tests/uce-catalog.browser.mjs [site URL] [debugger URL]
import assert from 'node:assert/strict';
import fs from 'node:fs';

const site = process.argv[2] || 'http://127.0.0.1:5173';
const debuggerUrl = process.argv[3] || 'http://127.0.0.1:9227';
const seed = JSON.parse(fs.readFileSync(new URL('../../backend/database/seeds/uce_academic_catalog.json', import.meta.url), 'utf8'));
const universities = await (await fetch(`${site}/api/universities/list.php`)).json();
const university = universities.data.find(row => row.slug === 'uce');
assert.ok(university, 'Existing UCE university');
const sections = await (await fetch(`${site}/api/university-sections/list.php?university_id=${university.id}`)).json();
assert.ok(sections.data.some(section => section.tipo === 'academic_offer'), 'Academic offer section remains published');
assert.ok(sections.data.some(section => section.tipo === 'leveling'), 'Leveling section is published independently');
const offers = await (await fetch(`${site}/api/academic-offers/list.php?university_id=${university.id}`)).json();
assert.ok(offers.data.length > 0, 'Institutional academic offer data remains available');
const catalog = await (await fetch(`${site}/api/leveling/list.php?university_id=${university.id}`)).json();
assert.equal(catalog.success, true);
assert.deepEqual(catalog.data.map(faculty => ({
 nombre: faculty.nombre,
 careers: faculty.careers.map(career => ({ nombre: career.nombre, subjects: career.subjects.map(subject => subject.nombre) })),
})), seed.faculties, 'Public API matches every source name and its order');

const pages = await (await fetch(`${debuggerUrl}/json/list`)).json();
const page = pages.find(row => row.type === 'page');
assert.ok(page, 'Browser page available');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
const pending = new Map();
socket.onmessage = event => {
 const message = JSON.parse(event.data);
 const request = pending.get(message.id);
 if (!request) return;
 pending.delete(message.id);
 clearTimeout(request.timer);
 if (message.error) request.reject(new Error(JSON.stringify(message.error)));
 else request.resolve(message.result);
};
function send(method, params = {}) {
 return new Promise((resolve, reject) => {
  const id = ++nextId;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timer });
  socket.send(JSON.stringify({ id, method, params }));
 });
}
async function evaluate(expression) {
 const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
 if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
 return result.result.value;
}
async function waitFor(expression) {
 for (let attempt = 0; attempt < 100; attempt++) {
  if (await evaluate(expression)) return;
  await new Promise(resolve => setTimeout(resolve, 100));
 }
 throw new Error(`Condition timed out: ${expression}`);
}
const count = selector => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
async function clickText(text) {
 await waitFor(`[...document.querySelectorAll('button')].some(button => button.textContent.trim() === ${JSON.stringify(text)})`);
 await evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent.trim() === ${JSON.stringify(text)}).click()`);
}
async function search(text) {
 await evaluate(`(() => {
  const input = document.querySelector('input[type="search"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(text)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
 })()`);
}

try {
 await send('Page.navigate', { url: `${site}/ingreso-a-la-u/uce` });
 await waitFor('[...document.querySelectorAll(".university-section h2")].some(heading => heading.textContent.toLowerCase().includes("nivelación"))');
 assert.equal(await evaluate(`document.querySelector("a[href='/ingreso-a-la-u/uce/nivelacion']")?.textContent`), 'Consultar nivelación universitaria');
 assert.equal(await evaluate(`document.querySelector("a[href*='oferta-academica']") === null`), true, 'Leveling is no longer exposed as academic offer');
 await send('Page.navigate', { url: `${site}/ingreso-a-la-u/uce/nivelacion` });
 await waitFor('document.querySelectorAll(".academic-catalog > .academic-catalog__accordion").length === 20');
 assert.equal(await count('.academic-catalog h4'), 71);
 assert.equal(await count('.academic-catalog__subjects li'), 337);
 assert.equal(await count('.academic-catalog__toggle[aria-expanded="true"]'), 0);
 await clickText('Expandir todo');
 await waitFor('document.querySelectorAll(".academic-catalog__toggle[aria-expanded=true]").length === 91');
 assert.equal(await count('.academic-catalog__content[hidden]'), 0);
 await clickText('Colapsar todo');
 await waitFor('document.querySelectorAll(".academic-catalog__content[hidden]").length === 91');
 await evaluate('document.querySelector(".academic-catalog__toggle").click()');
 await waitFor('document.querySelector(".academic-catalog__toggle").getAttribute("aria-expanded") === "true"');
 await evaluate('document.querySelector(".academic-catalog h4 button").click()');
 await waitFor('document.querySelector(".academic-catalog h4 button").getAttribute("aria-expanded") === "true"');
 await search('Medicina');
 await waitFor('document.querySelectorAll(".academic-catalog h4").length === 2');
 await search('biologia humana');
 await waitFor('document.querySelectorAll(".academic-catalog h4").length === 5');
 assert.equal(await count('.academic-catalog__toggle[aria-expanded="true"]'), 6);
 await clickText('Colapsar todo');
 await waitFor('document.querySelectorAll(".academic-catalog__toggle[aria-expanded=true]").length === 0');
 await search('sin-coincidencias-uce');
 await waitFor('document.querySelector(".academic-catalog").textContent.includes("No se encontraron")');
 await search('');
 await waitFor('document.querySelectorAll(".academic-catalog h4").length === 71');
 await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
 await clickText('Expandir todo');
 await waitFor('document.querySelectorAll(".academic-catalog__content[hidden]").length === 0');
 assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'No horizontal overflow on mobile');
 console.log('OK: independent academic offer and leveling sections; source/API parity; leveling route; 20 faculties, 71 careers, 337 subjects; individual accordions; expand/collapse; career and unaccented subject search; empty results; reset; mobile overflow.');
} finally {
 await send('Emulation.clearDeviceMetricsOverride');
 socket.close();
}
