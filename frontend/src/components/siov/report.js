import reportLogo from "../../assets/images/siov-report-logo.png";
import { studentError } from "./studentValidation";
import { chartConfig } from "./chartConfig";
import { reportText } from "./reportText";

const BRAND = [27, 79, 130];
const BRAND2 = [123, 167, 199];
const INK = [27, 36, 48];
const MUTED = [82, 96, 115];
const LINE = [222, 228, 236];

export async function generarInformePDF({
  state,resultadoAreas,AREAS,UNIVERSIDADES,OFERTA_CARRERAS,
}) {
  const invalid = studentError(state.estudiante);
  if (invalid) throw new Error(invalid.message);

  const [{ default: Chart }, { jsPDF }] = await Promise.all([
    import("chart.js/auto"),
    import("jspdf"),
  ]);

  const text = reportText({ state, resultadoAreas, AREAS });
  const e = state.estudiante;

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = width - margin * 2;
  const bottom = height - 62;

  let y = 76;
  let currentSection = "Presentación";

  const reportNo = "SIOV-" + Date.now().toString().slice(-8);

  const fecha = new Date().toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const blob = await (await fetch(reportLogo)).blob();
  const logo = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

  function font(size = 10, style = "normal", color = INK) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  }

  function lines(value, w = contentWidth, size = 10, style = "normal") {
    font(size, style);
    return doc.splitTextToSize(String(value), w);
  }

  /*===================ENCABEZADO===================*/

  function header(label) {
    // Primera franja: azul oscuro
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, width, 50, "F");

    // Segunda franja: azul claro
    doc.setFillColor(...BRAND2);
    doc.rect(0, 50, width, 4, "F");

    try {
      doc.addImage(logo, "PNG", margin, 6, 36, 36);
    } catch {
      // El informe continúa aunque el logo no pueda cargarse.
    }

    font(11, "bold", [255, 255, 255]);
    doc.text("Instituto Politécnico Insignare", margin + 46, 23);

    font(8, "normal", [255, 255, 255]);
    doc.text("Área de Orientación Vocacional · SIOV", margin + 46, 37);
    doc.text(label, width - margin, 23, { align: "right" });
    doc.text("Informe N.° " + reportNo, width - margin, 37, { align: "right" });
  }

  function page(label = currentSection) {
    currentSection = label;
    doc.addPage();
    y = 76;
    header(label);
  }

  function ensure(h) {
    if (y + h > bottom) page();
  }

  function heading(label, needed = 40) {
    const wrapped = lines(label, contentWidth - 12, 13, "bold");
    ensure(wrapped.length * 16 + needed);

    doc.setFillColor(...BRAND2);
    doc.rect(margin, y - 10, 4, wrapped.length * 16, "F");

    font(13, "bold", BRAND);
    doc.text(wrapped, margin + 11, y, { lineHeightFactor: 1.23 });

    y += wrapped.length * 16 + 9;
  }

  function paragraph(
    value,
    {
      size = 10,
      gap = 9,
      x = margin,
      w = contentWidth,
      style = "normal",
    } = {}
  ) {
    const wrapped = lines(value, w, size, style);
    const lineHeight = size * 1.3;

    for (const line of wrapped) {
      ensure(lineHeight);
      font(size, style);
      doc.text(line, x, y);
      y += lineHeight;
    }

    y += gap;
  }

  function bullet(value) {
    paragraph("• " + value, {
      x: margin + 4,
      w: contentWidth - 4,
      size: 9.5,
      gap: 3,
    });
  }

  /*===================PORTADA===================*/

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // ===== DOBLE FRANJA SUPERIOR =====
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, width, 12, "F");

  doc.setFillColor(...BRAND2);
  doc.rect(0, 12, width, 4, "F");

  // ===== DOBLE FRANJA INFERIOR =====
  doc.setFillColor(...BRAND2);
  doc.rect(0, height - 16, width, 4, "F");

  doc.setFillColor(...BRAND);
  doc.rect(0, height - 12, width, 12, "F");

  const coverLogoWidth = 82;
  const coverLogoHeight = 82;
  const coverLogoX = (width - coverLogoWidth) / 2;

  try {
    doc.addImage(
      logo,
      "PNG",
      coverLogoX,
      70,
      coverLogoWidth,
      coverLogoHeight
    );
  } catch {
    // El informe continúa aunque el logo no pueda cargarse.
  }

  font(14, "bold", BRAND);
  doc.text("INSTITUTO POLITÉCNICO INSIGNARE", width / 2, 185, {
    align: "center",
  });

  font(9, "normal", BRAND);
  doc.text("Área de Orientación Vocacional", width / 2, 202, {
    align: "center",
  });

  doc.setDrawColor(...BRAND2);
  doc.setLineWidth(1.5);
  doc.line(width / 2 - 90, 220, width / 2 + 90, 220);

  font(23, "bold", INK);
  doc.text("Informe de Orientación", width / 2, 350, { align: "center" });
  doc.text("Vocacional", width / 2, 382, { align: "center" });

  font(10, "italic", MUTED);
  doc.text(
    "Sistema Inteligente de Orientación Vocacional (SIOV)",
    width / 2,
    410,
    { align: "center" }
  );

  const coverBoxWidth = 345;
  const coverBoxHeight = 82;
  const coverBoxX = (width - coverBoxWidth) / 2;
  const coverBoxY = 455;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.roundedRect(
    coverBoxX,
    coverBoxY,
    coverBoxWidth,
    coverBoxHeight,
    7,
    7
  );

  font(11, "bold", INK);
  doc.text(e.nombres || "Estudiante", width / 2, coverBoxY + 29, {
    align: "center",
  });

  font(9, "normal", INK);
  doc.text("Cédula: " + (e.cedula || "-"), width / 2, coverBoxY + 47, {
    align: "center",
  });

  font(7.5, "normal", MUTED);
  doc.text(
    "Informe N.° " +
      reportNo +
      "  ·  Quito, Ecuador, " +
      fecha,
    width / 2,
    coverBoxY + 69,
    { align: "center" }
  );

  /*===================PÁGINA: PRESENTACIÓN===================*/

  page("Presentación");

  heading("Sobre el SIOV");
  paragraph(text.introduction, { size: 9.5, gap: 8 });

  heading("Alcance del Instrumento");

  paragraph("¿Qué mide el SIOV?", {
    style: "bold",
    gap: 4,
  });

  text.measures.forEach(bullet);

  paragraph("¿Qué NO mide el SIOV?", {
    style: "bold",
    gap: 4,
  });

  text.limits.forEach(bullet);

  heading("Recomendación de Uso");
  paragraph(text.recommendation, { size: 9.5 });

  /*===================PÁGINA: RESULTADOS===================*/

  page("Resultados");
  heading("Resultados por Área Vocacional");

  for (const [i, a] of resultadoAreas.entries()) {
    const name = lines(
      `${i + 1}. ${a.nombre}`,
      contentWidth - 155,
      10,
      "bold"
    );

    ensure(name.length * 13 + 20);

    font(10, "bold");
    doc.text(name, margin, y, { lineHeightFactor: 1.3 });

    font(9);
    doc.text(
      `${a.puntaje} de ${a.total} preguntas · ${a.porcentaje}%`,
      width - margin,
      y,
      { align: "right" }
    );

    y += name.length * 13 + 3;

    doc.setFillColor(...LINE);
    doc.rect(margin, y, contentWidth, 5, "F");

    if (Array.isArray(a.color)) {
      doc.setFillColor(...a.color);
    } else {
      const hex = String(a.color || "#1B4F82").replace("#", "");
      doc.setFillColor(
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
      );
    }

    if (a.porcentaje > 0) {
      doc.rect(
        margin,
        y,
        contentWidth * (a.porcentaje / 100),
        5,
        "F"
      );
    }

    y += 15;
  }

  /*===================GRÁFICOS===================*/

  async function chart(type, label, caption, h) {
    ensure(h + 53);
    heading(label, h + 25);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(contentWidth);
    canvas.height = h;

    const chart = new Chart(
      canvas,
      chartConfig(resultadoAreas, type, true)
    );

    try {
      chart.update("none");

      doc.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        y,
        contentWidth,
        h
      );

      y += h + 12;

      paragraph(caption, {
        size: 8.5,
        gap: 8,
      });
    } finally {
      chart.destroy();
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  /*===================GRÁFICO: BARRAS===================*/

  await chart(
    "bar",
    "Gráfico de Afinidad por Área",
    "Figura 1. Porcentaje de afinidad vocacional por área.",
    175
  );

  /*===================GRÁFICO: RADAR=================== */

  await chart(
    "radar",
    "Perfil Vocacional",
    "Figura 2. Perfil vocacional comparativo entre áreas.",
    220
  );

  /*===================PÁGINA: INTERPRETACIÓN===================*/

  page("Interpretación");

  heading("Interpretación Profesional de Resultados");
  paragraph(text.interpretation, { size: 10 });

  heading("Carreras Relacionadas con el Área Predominante");

  AREAS[resultadoAreas[0].codigo].profesiones
    .slice(0, 15)
    .forEach(bullet);

  /*===================TABLA COMPARATIVA DE CARRERAS===================*/

  if (state.comparador?.length >= 2) {
    const careers = state.comparador
      .map((i) => OFERTA_CARRERAS[i])
      .filter(Boolean);

    heading("Tabla Comparativa de Carreras", 85);

    paragraph(
      "Comparación elaborada por el estudiante durante la revisión de resultados.",
      { size: 9 }
    );

    const fields = [
      ["Universidad", (c) => UNIVERSIDADES[c.uni].nombre],
      ["Facultad", (c) => c.facultad],
      ["Carrera", (c) => c.carrera],
      ["Título", (c) => c.titulo],
      ["Duración", (c) => c.duracion],
      ["Modalidad", (c) => c.modalidad],
      ["Campo Laboral", (c) => c.campoLaboral],
    ];

    const labelWidth = 83;
    const col = (contentWidth - labelWidth) / careers.length;

    for (const [label, get] of fields) {
      const cells = careers.map((c) =>
        lines(get(c), col - 12, 9)
      );

      const lh = 11.7;
      const h =
        Math.max(...cells.map((c) => c.length), 1) * lh + 12;

      ensure(h);

      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y - 10, contentWidth, h, "F");

      font(9, "bold");
      doc.text(
        lines(label, labelWidth - 8, 9, "bold"),
        margin + 4,
        y
      );

      font(9);

      cells.forEach((cell, i) => {
        doc.text(
          cell,
          margin + labelWidth + i * col + 6,
          y,
          { lineHeightFactor: 1.3 }
        );
      });

      y += h + 3;
    }
  }

  /*===================PÁGINA: OFERTA ACADÉMICA===================*/

  page("Oferta Académica");

  heading("Oferta Académica por Universidad");

  paragraph(text.offers, { size: 9.5 });

  const top = resultadoAreas
    .slice(0, 2)
    .map((a) => a.codigo);

  const offers = OFERTA_CARRERAS.filter((c) =>
    top.includes(c.area)
  );

  const colWidth = (contentWidth - 20) / 2;

  for (const [code, uni] of Object.entries(UNIVERSIDADES)) {
    const rows = offers.filter((c) => c.uni === code);

    heading(uni.nombre, 70);

    paragraph(
      "Tipo de prueba de admisión: " + uni.tipoPrueba,
      {
        size: 9,
        gap: 9,
      }
    );

    if (!rows.length) {
      paragraph(
        uni.nombre +
          " no cuenta actualmente con carreras vinculadas a las áreas predominantes del estudiante.",
        { size: 9.5 }
      );
      continue;
    }

    for (let i = 0; i < rows.length; i += 2) {
      const pair = rows.slice(i, i + 2).map((c) => ({
        name: lines(c.carrera, colWidth - 16, 10, "bold"),
        meta: lines(
          `(${c.titulo} · ${c.duracion} · ${c.modalidad})`,
          colWidth - 16,
          9
        ),
        body: lines(c.campoLaboral, colWidth - 16, 9),
      }));

      const h = Math.max(
        ...pair.map(
          (c) =>
            c.name.length * 13 +
            c.meta.length * 11.7 +
            c.body.length * 11.7 +
            26
        )
      );

      ensure(h);

      pair.forEach((c, j) => {
        const x = margin + j * (colWidth + 20);
        let cy = y;

        doc.setDrawColor(...LINE);
        doc.roundedRect(
          x,
          cy - 11,
          colWidth,
          h - 3,
          5,
          5
        );

        font(10, "bold", BRAND);
        doc.text(c.name, x + 8, cy, {
          lineHeightFactor: 1.3,
        });

        cy += c.name.length * 13 + 3;

        font(9, "italic", MUTED);
        doc.text(c.meta, x + 8, cy, {
          lineHeightFactor: 1.3,
        });

        cy += c.meta.length * 11.7 + 5;

        font(9);
        doc.text(c.body, x + 8, cy, {
          lineHeightFactor: 1.3,
        });
      });

      y += h + 8;
    }

    y += 6;
  }

  /*===================PÁGINA: RECOMENDACIONES===================*/

  page("Recomendaciones");

  heading("TOP 10 Carreras Sugeridas");

  offers.slice(0, 10).forEach((c, i) => {
    ensure(24);

    doc.setFillColor(...BRAND);
    doc.circle(margin + 9, y - 3, 8, "F");

    font(8, "bold", [255, 255, 255]);
    doc.text(String(i + 1), margin + 9, y - 0.5, {
      align: "center",
    });

    font(10, "normal", INK);

    const careerLines = lines(
      `${c.carrera} — ${UNIVERSIDADES[c.uni].nombre}`,
      contentWidth - 28,
      10
    );

    doc.text(careerLines, margin + 24, y, {
      lineHeightFactor: 1.3,
    });

    y += careerLines.length * 13 + 7;
  });

  /*===================CONCLUSIÓN===================*/

  heading("Conclusión y Recomendación Final");
  paragraph(text.conclusion);

  /*===================REFERENCIAS===================*/

  heading("Referencias");

  text.references.forEach((r) => {
    paragraph("— " + r, {
      size: 9,
      gap: 7,
    });
  });

  /* ===================PIE DE PÁGINA===================*/

  const pages = doc.internal.getNumberOfPages();

  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);

    if (p === 1) continue;

    doc.setDrawColor(...BRAND2);
    doc.setLineWidth(1);
    doc.line(
      margin,
      height - 48,
      width - margin,
      height - 48
    );

    font(8, "normal", MUTED);

    doc.text(
      "Instituto Politécnico Insignare · 0962 759 826 / 0969 069 558 · @inst_insignare",
      margin,
      height - 35
    );

    doc.text(
      "institutoinsignare.com",
      margin,
      height - 23
    );

    doc.text(
      `Página ${p} / ${pages}`,
      width - margin,
      height - 23,
      { align: "right" }
    );
  }

  /*===================GENERACIÓN FINAL DEL PDF===================*/

  doc.save(
    "Informe_Orientacion_Vocacional_" +
      (e.nombres || "estudiante")
        .trim()
        .replace(/\s+/g, "_") +
      ".pdf"
  );

  return { pages };
}
