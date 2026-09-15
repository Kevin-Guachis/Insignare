import reportLogo from "../../assets/images/siov-report-logo.png";
import { loadSiovLibraries } from "./libraries";
const PDF_BRAND    = [27, 79, 130];
const PDF_BRAND2   = [123, 167, 199];

const PDF_INK      = [27, 36, 48];
const PDF_MUTED    = [107, 114, 128];
const PDF_LINE     = [222, 228, 236];

function pdfHexToRgb(hex){
  const h = hex.replace("#","");
  return [parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)];
}

export async function generarInformePDF({ state, resultadoAreas, AREAS, UNIVERSIDADES, OFERTA_CARRERAS, barCanvas, radarCanvas }){
  await loadSiovLibraries();
  const bytes=await (await fetch(reportLogo)).blob();
  const SIOV_LOGO_BASE64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(bytes);});
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin*2;
  const reportNo = "SIOV-" + Date.now().toString().slice(-8);
  const e = state.estudiante;
  const fecha = new Date().toLocaleDateString("es-EC",{year:"numeric",month:"long",day:"numeric"});
  doc.setFont("times");

  function header(seccion){
    doc.setFillColor(...PDF_BRAND);
    doc.rect(0,0,pageWidth,56,"F");
    doc.setFillColor(...PDF_BRAND2);
    doc.rect(0,52,pageWidth,4,"F");
    try{ doc.addImage(SIOV_LOGO_BASE64,"PNG",margin,5,42,42); }catch { /* Keep the report usable if its decorative logo cannot be decoded. */ }
    doc.setTextColor(255,255,255);
    doc.setFont("times","bold"); doc.setFontSize(11);
    doc.text("Instituto Politécnico Insignare", margin+52, 24);
    doc.setFont("times","normal"); doc.setFontSize(8.5);
    doc.text("Área de Orientación Vocacional · SIOV", margin+52, 37);
    doc.setFontSize(8.5);
    doc.text(seccion, pageWidth-margin, 24, {align:"right"});
    doc.text(`Informe N.° ${reportNo}`, pageWidth-margin, 37, {align:"right"});
    doc.setTextColor(...PDF_INK); doc.setFont("times","normal");
  }

  function footer(){
    doc.setDrawColor(...PDF_BRAND2);
    doc.line(margin, pageHeight-48, pageWidth-margin, pageHeight-48);
    doc.setFillColor(...PDF_BRAND);
    doc.rect(0, pageHeight-38, pageWidth, 38, "F");
    doc.setFont("times","normal"); doc.setFontSize(7.5);
    doc.setTextColor(255,255,255);
    doc.text(`Instituto Politécnico Insignare · lightcoral-reindeer-735935.hostingersite.com · 0962 759 826 / 0969 069 558 · @inst_insignare`, pageWidth/2, pageHeight-22, {align:"center"});
    doc.text(`${fecha}  ·  Página ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth/2, pageHeight-10, {align:"center"});
    doc.setTextColor(...PDF_INK);
  }

  function sectionTitle(texto, y){
    doc.setFillColor(...PDF_BRAND2);
    doc.rect(margin, y-13, 4, 18, "F");
    doc.setFont("times","bold"); doc.setFontSize(13);
    doc.setTextColor(...PDF_BRAND);
    doc.text(texto, margin+12, y);
    doc.setTextColor(...PDF_INK); doc.setFont("times","normal");
    return y+22;
  }

  function checkPageBreak(y, needed=60){
    if(y > pageHeight - 90 - needed + 60){
      footer(); doc.addPage(); header("Continuación"); return 90;
    }
    return y;
  }

  /* ===== PORTADA ===== */
  doc.setFillColor(255,255,255);
  doc.rect(0,0,pageWidth,pageHeight,"F");
  doc.setFillColor(...PDF_BRAND);
  doc.rect(0,0,pageWidth,12,"F");
  doc.rect(0,pageHeight-12,pageWidth,12,"F");
  doc.setFillColor(...PDF_BRAND2);
  doc.rect(0,12,pageWidth,4,"F");
  doc.rect(0,pageHeight-16,pageWidth,4,"F");

  try{ doc.addImage(SIOV_LOGO_BASE64,"PNG",pageWidth/2-55,80,110,110); }catch { /* Keep the report usable if its decorative logo cannot be decoded. */ }

  doc.setTextColor(...PDF_BRAND);
  doc.setFont("times","bold"); doc.setFontSize(15);
  doc.text("INSTITUTO POLITÉCNICO INSIGNARE", pageWidth/2, 230, {align:"center"});
  doc.setFont("times","normal"); doc.setFontSize(11);
  doc.text("Área de Orientación Vocacional", pageWidth/2, 248, {align:"center"});
  doc.setDrawColor(...PDF_BRAND2); doc.setLineWidth(1.5);
  doc.line(pageWidth/2-100, 268, pageWidth/2+100, 268);

  doc.setFont("times","bold"); doc.setFontSize(26); doc.setTextColor(...PDF_INK);
  doc.text("Informe de Orientación", pageWidth/2, pageHeight/2-16, {align:"center"});
  doc.text("Vocacional", pageWidth/2, pageHeight/2+18, {align:"center"});
  doc.setFont("times","italic"); doc.setFontSize(11); doc.setTextColor(...PDF_MUTED);
  doc.text("Sistema Inteligente de Orientación Vocacional (SIOV)", pageWidth/2, pageHeight/2+44, {align:"center"});

  doc.setDrawColor(...PDF_LINE); doc.setLineWidth(1);
  doc.roundedRect(pageWidth/2-170, pageHeight/2+80, 340, 92, 8, 8);
  doc.setTextColor(...PDF_INK); doc.setFont("times","bold"); doc.setFontSize(14);
  doc.text(e.nombres||"Estudiante", pageWidth/2, pageHeight/2+112, {align:"center"});
  doc.setFont("times","normal"); doc.setFontSize(10);
  doc.text(`Cédula: ${e.cedula||"-"}`, pageWidth/2, pageHeight/2+130, {align:"center"});
  doc.text(`${e.institucion||""}`, pageWidth/2, pageHeight/2+148, {align:"center"});
  doc.setFontSize(9); doc.setTextColor(...PDF_MUTED);
  doc.text(`Informe N.° ${reportNo}  ·  Quito, Ecuador, ${fecha}`, pageWidth/2, pageHeight/2+168, {align:"center"});

  /* ===== PÁGINA: PRESENTACIÓN ===== */
  doc.addPage(); let y = 90;
  header("Presentación");
  y = sectionTitle("Sobre el SIOV", y);
  doc.setFont("times","normal"); doc.setFontSize(10.5);
  const textoSiov = doc.splitTextToSize(
    `El Sistema Inteligente de Orientación Vocacional (SIOV) es un instrumento psicométrico desarrollado por el `+
    `Instituto Politécnico Insignare con el propósito de apoyar a los estudiantes en la identificación de sus `+
    `intereses y preferencias vocacionales. El test consta de ${Object.values(AREAS).reduce((sum,a)=>sum+a.preguntas.length,0)} ítems de respuesta cerrada (Sí / No me interesa), `+
    `organizados en ${Object.keys(AREAS).length} grandes áreas del conocimiento, con ${[...new Set(Object.values(AREAS).map(a=>a.preguntas.length))].join("/")} preguntas por área. Cada ítem describe una `+
    `actividad concreta relacionada con un campo profesional; el estudiante debe indicar únicamente si dicha `+
    `actividad le genera interés o no, con total libertad y sinceridad, sin que existan respuestas correctas `+
    `ni incorrectas. El sistema calcula el porcentaje de afinidad para cada área y genera un perfil vocacional `+
    `comparativo que sirve de base para orientar la decisión de carrera universitaria.`, contentWidth);
  doc.text(textoSiov, margin, y); y += textoSiov.length*14+16;

  y = sectionTitle("Alcance del Instrumento", y);
  doc.setFont("times","bold"); doc.setFontSize(10.5); doc.setTextColor(...PDF_BRAND);
  doc.text("¿Qué mide el SIOV?", margin, y); y+=14;
  doc.setFont("times","normal"); doc.setTextColor(...PDF_INK);
  const mideMide = [
    "El nivel de afinidad e interés vocacional del estudiante en cinco áreas del conocimiento.",
    "La orientación hacia actividades académicas y profesionales de cada campo disciplinar.",
    "El perfil comparativo entre áreas para identificar la vocación predominante.",
    "La coherencia entre los intereses personales y la oferta académica universitaria disponible."
  ];
  mideMide.forEach(t=>{ const l=doc.splitTextToSize("• "+t, contentWidth-10); doc.text(l,margin+6,y); y+=l.length*13+4; });
  y+=6;
  doc.setFont("times","bold"); doc.setFontSize(10.5); doc.setTextColor(...PDF_BRAND);
  doc.text("¿Qué NO mide el SIOV?", margin, y); y+=14;
  doc.setFont("times","normal"); doc.setTextColor(...PDF_INK);
  const noMide = [
    "Aptitudes intelectuales, inteligencia ni capacidades cognitivas.",
    "Rendimiento académico ni habilidades técnicas específicas.",
    "Rasgos de personalidad ni aspectos psicológicos profundos.",
    "Garantía de éxito en ninguna carrera o área profesional determinada."
  ];
  noMide.forEach(t=>{ const l=doc.splitTextToSize("• "+t, contentWidth-10); doc.text(l,margin+6,y); y+=l.length*13+4; });
  y+=10;

  y = checkPageBreak(y, 80);
  y = sectionTitle("Recomendación de Uso", y);
  const recUso = doc.splitTextToSize(
    `Los resultados de este instrumento constituyen una referencia orientadora y deben complementarse con `+
    `un proceso de orientación vocacional personalizada, preferentemente conducido por un profesional en `+
    `psicopedagogía o orientación educativa. Se recomienda al estudiante y a su familia considerar estos `+
    `resultados como un insumo de partida para la reflexión, enriquecido con la consulta directa a `+
    `profesionales en ejercicio y la exploración de la oferta académica oficial de cada institución universitaria.`, contentWidth);
  doc.text(recUso, margin, y); y+=recUso.length*14+16;

  y = checkPageBreak(y, 90);
  y = sectionTitle("Datos del Estudiante", y);
  const datosTabla = [
    ["Nombres y Apellidos", e.nombres||"-"], ["Cédula", e.cedula||"-"], ["Edad", String(e.edad||"-")],
    ["Celular", e.celular||"-"], ["Correo electrónico", e.correo||"-"],
    ["Institución educativa", e.institucion||"-"], ["Estado académico", e.estado||"-"]
  ];
  datosTabla.forEach(([label,val])=>{
    doc.setFont("times","bold"); doc.setTextColor(...PDF_MUTED); doc.setFontSize(10);
    doc.text(label+":", margin, y);
    doc.setFont("times","normal"); doc.setTextColor(...PDF_INK);
    doc.text(String(val), margin+165, y); y+=16;
  });
  footer();

  /* ===== PÁGINA: RESULTADOS ===== */
  doc.addPage(); y=90;
  header("Resultados");
  y = sectionTitle("Resultados por Área Vocacional", y);
  doc.setFont("times","normal"); doc.setFontSize(10);
  resultadoAreas.forEach((a,i)=>{
    const barColor = pdfHexToRgb(a.color);
    doc.setFont("times","bold"); doc.setFontSize(10.5);
    doc.text(`${i+1}. ${a.nombre}`, margin, y);
    doc.setFont("times","normal");
    doc.text(`${a.puntaje} de ${a.total} preguntas · ${a.porcentaje}%`, pageWidth-margin, y, {align:"right"});
    y+=8;
    doc.setFillColor(...PDF_LINE); doc.roundedRect(margin, y, contentWidth, 9, 4, 4, "F");
    doc.setFillColor(...barColor); doc.roundedRect(margin, y, Math.max(contentWidth*(a.porcentaje/100),10), 9, 4, 4, "F");
    y+=26;
  });
  y+=6;

  y = checkPageBreak(y, 240);
  y = sectionTitle("Gráfico de Afinidad por Área", y);

  const imgBar = barCanvas.toDataURL("image/png",1.0);
  const barW = contentWidth;
  const barH = barW*(barCanvas.height/barCanvas.width);
  doc.addImage(imgBar,"PNG",margin,y,barW,barH); y+=barH+16;
  doc.setFont("times","italic"); doc.setFontSize(9); doc.setTextColor(...PDF_MUTED);
  doc.text("Figura 1. Porcentaje de afinidad vocacional por área.", margin, y);
  doc.setTextColor(...PDF_INK); y+=18;

  y = checkPageBreak(y, 260);

  const imgRadar = radarCanvas.toDataURL("image/png",1.0);
  const radarSize = Math.min(contentWidth*0.72, 360);
  const radarH = radarSize*(radarCanvas.height/radarCanvas.width);
  doc.addImage(imgRadar,"PNG",pageWidth/2-radarSize/2,y,radarSize,radarH); y+=radarH+14;
  doc.setFont("times","italic"); doc.setFontSize(9); doc.setTextColor(...PDF_MUTED);
  doc.text("Figura 2. Perfil vocacional comparativo entre áreas.", pageWidth/2, y, {align:"center"});
  doc.setTextColor(...PDF_INK);
  footer();

  /* ===== PÁGINA: INTERPRETACIÓN ===== */
  doc.addPage(); y=90;
  header("Interpretación");
  y = sectionTitle("Interpretación Profesional de Resultados", y);
  const nombre = (e.nombres||"El/La estudiante").split(" ")[0];
  const principal = resultadoAreas[0], secundaria = resultadoAreas[1], terciaria = resultadoAreas[2];
  const interpTexto = doc.splitTextToSize(
    `De acuerdo con los resultados obtenidos en la aplicación del SIOV, ${nombre} presenta su mayor afinidad `+
    `vocacional en el área de ${principal.nombre}, con un puntaje de ${principal.puntaje} sobre ${principal.total} preguntas `+
    `(${principal.porcentaje}%). Este resultado indica ${AREAS[principal.codigo].descripcion} `+
    `En segundo lugar se identifica el área de ${secundaria.nombre} (${secundaria.puntaje}/${secundaria.total}, ${secundaria.porcentaje}%), `+
    `seguida del área de ${terciaria.nombre} (${terciaria.porcentaje}%), lo cual evidencia un perfil de intereses `+
    `complementarios que puede enriquecer el proceso de elección profesional.\n\n`+
    `Desde el Área de Orientación Vocacional del Instituto Politécnico Insignare se recomienda que la familia `+
    `y el estudiante profundicen la exploración en las dos áreas de mayor puntaje mediante el diálogo con `+
    `orientadores académicos, la revisión de las mallas curriculares y, de ser posible, experiencias de `+
    `acercamiento profesional —charlas con egresados, ferias vocacionales o pasantías de observación— `+
    `antes de tomar una decisión definitiva sobre la carrera universitaria a seguir.`, contentWidth);
  doc.text(interpTexto, margin, y); y+=interpTexto.length*14+16;

  y = checkPageBreak(y, 200);
  y = sectionTitle("Carreras Relacionadas con el Área Predominante", y);
  doc.setFont("times","normal"); doc.setFontSize(9.8);
  AREAS[resultadoAreas[0].codigo].profesiones.slice(0,15).forEach(p=>{
    y = checkPageBreak(y, 16);
    doc.setFillColor(...PDF_BRAND2); doc.circle(margin+3, y-3, 2, "F");
    doc.text(p, margin+12, y); y+=15;
  });
  footer();

  /* ===== PÁGINA: OFERTA ACADÉMICA ===== */
  doc.addPage(); y=90;
  header("Oferta Académica");
  y = sectionTitle("Oferta Académica por Universidad", y);
  doc.setFont("times","italic"); doc.setFontSize(9.5); doc.setTextColor(...PDF_MUTED);
  const introOfer = doc.splitTextToSize(
    `A continuación se detalla la oferta académica referencial de la EPN, UCE y ESPE relacionada con las áreas `+
    `de mayor afinidad vocacional identificadas. Se recomienda verificar la información vigente directamente `+
    `en los portales oficiales de cada institución antes de tomar una decisión.`, contentWidth);
  doc.text(introOfer, margin, y); doc.setTextColor(...PDF_INK); doc.setFont("times","normal");
  y+=introOfer.length*13+16;

  const codP = resultadoAreas[0].codigo, codS = resultadoAreas[1].codigo;
  const ofertaUni = OFERTA_CARRERAS.filter(c=>c.area===codP||c.area===codS);
  Object.keys(UNIVERSIDADES).forEach(codUni=>{
    const uni = UNIVERSIDADES[codUni];
    const filasUni = ofertaUni.filter(c=>c.uni===codUni);
    y = checkPageBreak(y, 70);
    doc.setFont("times","bold"); doc.setFontSize(11); doc.setTextColor(...PDF_BRAND);
    doc.text(uni.nombre, margin, y);
    doc.setFont("times","normal"); doc.setFontSize(9); doc.setTextColor(...PDF_MUTED);
    doc.text(`Tipo de prueba de admisión: ${uni.tipoPrueba}`, margin, y+13);
    doc.setTextColor(...PDF_INK); y+=26;
    if(filasUni.length){
      filasUni.forEach(c=>{
        y = checkPageBreak(y, 38);
        doc.setFont("times","bold"); doc.setFontSize(10);
        doc.text(`• ${c.carrera}`, margin+6, y);
        doc.setFont("times","italic"); doc.setFontSize(9); doc.setTextColor(...PDF_MUTED);
        doc.text(`(${c.titulo} · ${c.duracion} · ${c.modalidad})`, margin+6, y+12);
        doc.setTextColor(...PDF_INK); doc.setFont("times","normal"); doc.setFontSize(9);
        const cl = doc.splitTextToSize(c.campoLaboral, contentWidth-12);
        doc.text(cl, margin+6, y+24); y+=24+cl.length*11+8;
      });
    } else {
      doc.setFont("times","italic"); doc.setFontSize(9.5); doc.setTextColor(...PDF_MUTED);
      const sinOf = doc.splitTextToSize(`${uni.nombre} no cuenta actualmente con carreras vinculadas a las áreas predominantes del estudiante.`, contentWidth-6);
      doc.text(sinOf, margin+6, y); doc.setTextColor(...PDF_INK); doc.setFont("times","normal"); y+=sinOf.length*12+10;
    }
    y+=6;
  });
  footer();

  /* ===== COMPARADOR (si se usó) ===== */
  if(state.comparador && state.comparador.length>=2){
    doc.addPage(); y=90;
    header("Comparador");
    y = sectionTitle("Tabla Comparativa de Carreras", y);
    doc.setFont("times","italic"); doc.setFontSize(9.5); doc.setTextColor(...PDF_MUTED);
    doc.text("Comparación elaborada por el estudiante durante la revisión de resultados.", margin, y);
    doc.setTextColor(...PDF_INK); doc.setFont("times","normal"); y+=22;
    const carrerasComp = state.comparador.map(i=>OFERTA_CARRERAS[i]).filter(Boolean);
    const filasComp=[["Universidad",c=>UNIVERSIDADES[c.uni].nombre],["Facultad",c=>c.facultad],["Carrera",c=>c.carrera],["Título",c=>c.titulo],["Duración",c=>c.duracion],["Modalidad",c=>c.modalidad],["Campo Laboral",c=>c.campoLaboral]];
    const colW = contentWidth/(carrerasComp.length+1);
    filasComp.forEach(([label,fn])=>{
      const rowLines = carrerasComp.map(c=>doc.splitTextToSize(fn(c), colW-8));
      const maxLines = Math.max(...rowLines.map(l=>l.length),1);
      y = checkPageBreak(y, maxLines*12+10);
      doc.setFillColor(...PDF_LINE); doc.rect(margin,y-10,contentWidth,maxLines*12+8,"F");
      doc.setFont("times","bold"); doc.setFontSize(9); doc.setTextColor(...PDF_BRAND);
      doc.text(label,margin+4,y);
      doc.setFont("times","normal"); doc.setTextColor(...PDF_INK);
      rowLines.forEach((lines,i)=>{ doc.text(lines,margin+colW*(i+1)+4,y); });
      y+=maxLines*12+12;
    });
    footer();
  }

  /* ===== CONCLUSIÓN ===== */
  doc.addPage(); y=90;
  header("Recomendaciones");
  y = sectionTitle("TOP 10 Carreras Sugeridas", y);
  const codPc = resultadoAreas[0].codigo, codSc = resultadoAreas[1].codigo;
  const top10c = OFERTA_CARRERAS.filter(c=>c.area===codPc||c.area===codSc).slice(0,10);
  top10c.forEach((c,i)=>{
    y = checkPageBreak(y, 20);
    doc.setFillColor(...PDF_BRAND); doc.circle(margin+8, y-3, 9, "F");
    doc.setTextColor(255,255,255); doc.setFont("times","bold"); doc.setFontSize(8.5);
    doc.text(String(i+1), margin+8, y-0.5, {align:"center"});
    doc.setTextColor(...PDF_INK); doc.setFont("times","normal"); doc.setFontSize(10);
    doc.text(`${c.carrera} — ${UNIVERSIDADES[c.uni].nombre}`, margin+22, y); y+=20;
  });
  y+=8;

  y = checkPageBreak(y, 150);
  y = sectionTitle("Conclusión y Recomendación Final", y);
  const concl = doc.splitTextToSize(
    `Con base en los resultados descritos, el Área de Orientación Vocacional del Instituto Politécnico Insignare `+
    `recomienda a ${e.nombres||"el/la estudiante"} considerar prioritariamente carreras vinculadas al área de `+
    `${AREAS[resultadoAreas[0].codigo].nombre}, complementando el análisis con opciones del área de `+
    `${AREAS[resultadoAreas[1].codigo].nombre}. Se sugiere validar esta orientación mediante consejería vocacional `+
    `personalizada y la revisión directa de la oferta académica oficial vigente de cada institución de educación superior.`, contentWidth);
  doc.text(concl, margin, y); y+=concl.length*14+24;

  y = checkPageBreak(y, 100);
  y = sectionTitle("Referencias", y);
  doc.setFont("times","normal"); doc.setFontSize(10.5);
  
  const refs = [
    `Instituto Politécnico Insignare. (${new Date().getFullYear()}). Sistema Inteligente de Orientación Vocacional (SIOV) [Software de evaluación vocacional]. Área de Orientación Vocacional.`,
    `Escuela Politécnica Nacional. (${new Date().getFullYear()}). Oferta de grado. https://www.epn.edu.ec/oferta-de-grado/`,
    `Universidad Central del Ecuador. (${new Date().getFullYear()}). Admisión. https://www.uce.edu.ec/web/admision`,
    `Universidad de las Fuerzas Armadas ESPE. (${new Date().getFullYear()}). Oferta académica presencial. https://www.espe.edu.ec/oferta-academica-espe-presencial/`
  ];
  refs.forEach(r=>{
    y = checkPageBreak(y, 30);
    const lines = doc.splitTextToSize(r, contentWidth-18);
    doc.text(lines, margin+18, y); doc.text("—", margin, y); y+=lines.length*13+6;
  });
  footer();

  doc.save(`Informe_Orientacion_Vocacional_${(e.nombres||"estudiante").replace(/\s+/g,"_")}.pdf`);
}
