// Texts preserved from the previous report; layout lives in report.js.
export function reportText({state,resultadoAreas,AREAS}){
const e=state.estudiante;const nombre=(e.nombres||"El/La estudiante").split(" ")[0];const [principal,secundaria,terciaria]=resultadoAreas;
return {
introduction:`El Sistema Inteligente de Orientación Vocacional (SIOV) es un instrumento psicométrico desarrollado por el `+
    `Instituto Politécnico Insignare con el propósito de apoyar a los estudiantes en la identificación de sus `+
    `intereses y preferencias vocacionales. El test consta de ${Object.values(AREAS).reduce((sum,a)=>sum+a.preguntas.length,0)} ítems de respuesta cerrada (Sí / No me interesa), `+
    `organizados en ${Object.keys(AREAS).length} grandes áreas del conocimiento, con ${[...new Set(Object.values(AREAS).map(a=>a.preguntas.length))].join("/")} preguntas por área. Cada ítem describe una `+
    `actividad concreta relacionada con un campo profesional; el estudiante debe indicar únicamente si dicha `+
    `actividad le genera interés o no, con total libertad y sinceridad, sin que existan respuestas correctas `+
    `ni incorrectas. El sistema calcula el porcentaje de afinidad para cada área y genera un perfil vocacional `+
    `comparativo que sirve de base para orientar la decisión de carrera universitaria.`,
measures:[
    "El nivel de afinidad e interés vocacional del estudiante en cinco áreas del conocimiento.",
    "La orientación hacia actividades académicas y profesionales de cada campo disciplinar.",
    "El perfil comparativo entre áreas para identificar la vocación predominante.",
    "La coherencia entre los intereses personales y la oferta académica universitaria disponible."
  ],
limits:[
    "Aptitudes intelectuales, inteligencia ni capacidades cognitivas.",
    "Rendimiento académico ni habilidades técnicas específicas.",
    "Rasgos de personalidad ni aspectos psicológicos profundos.",
    "Garantía de éxito en ninguna carrera o área profesional determinada."
  ],
recommendation:`Los resultados de este instrumento constituyen una referencia orientadora y deben complementarse con `+
    `un proceso de orientación vocacional personalizada, preferentemente conducido por un profesional en `+
    `psicopedagogía o orientación educativa. Se recomienda al estudiante y a su familia considerar estos `+
    `resultados como un insumo de partida para la reflexión, enriquecido con la consulta directa a `+
    `profesionales en ejercicio y la exploración de la oferta académica oficial de cada institución universitaria.`,
interpretation:`De acuerdo con los resultados obtenidos en la aplicación del SIOV, ${nombre} presenta su mayor afinidad `+
    `vocacional en el área de ${principal.nombre}, con un puntaje de ${principal.puntaje} sobre ${principal.total} preguntas `+
    `(${principal.porcentaje}%). Este resultado indica ${AREAS[principal.codigo].descripcion} `+
    `En segundo lugar se identifica el área de ${secundaria.nombre} (${secundaria.puntaje}/${secundaria.total}, ${secundaria.porcentaje}%), `+
    `seguida del área de ${terciaria.nombre} (${terciaria.porcentaje}%), lo cual evidencia un perfil de intereses `+
    `complementarios que puede enriquecer el proceso de elección profesional.\n\n`+
    `Desde el Área de Orientación Vocacional del Instituto Politécnico Insignare se recomienda que la familia `+
    `y el estudiante profundicen la exploración en las dos áreas de mayor puntaje mediante el diálogo con `+
    `orientadores académicos, la revisión de las mallas curriculares y, de ser posible, experiencias de `+
    `acercamiento profesional —charlas con egresados, ferias vocacionales o pasantías de observación— `+
    `antes de tomar una decisión definitiva sobre la carrera universitaria a seguir.`,
offers:`A continuación se detalla la oferta académica referencial de la EPN, UCE y ESPE relacionada con las áreas `+
    `de mayor afinidad vocacional identificadas. Se recomienda verificar la información vigente directamente `+
    `en los portales oficiales de cada institución antes de tomar una decisión.`,
conclusion:`Con base en los resultados descritos, el Área de Orientación Vocacional del Instituto Politécnico Insignare `+
    `recomienda a ${e.nombres||"el/la estudiante"} considerar prioritariamente carreras vinculadas al área de `+
    `${AREAS[resultadoAreas[0].codigo].nombre}, complementando el análisis con opciones del área de `+
    `${AREAS[resultadoAreas[1].codigo].nombre}. Se sugiere validar esta orientación mediante consejería vocacional `+
    `personalizada y la revisión directa de la oferta académica oficial vigente de cada institución de educación superior.`,
references:[
    `Instituto Politécnico Insignare. (${new Date().getFullYear()}). Sistema Inteligente de Orientación Vocacional (SIOV) [Software de evaluación vocacional]. Área de Orientación Vocacional.`,
    `Escuela Politécnica Nacional. (${new Date().getFullYear()}). Oferta de grado. https://www.epn.edu.ec/oferta-de-grado/`,
    `Universidad Central del Ecuador. (${new Date().getFullYear()}). Admisión. https://www.uce.edu.ec/web/admision`,
    `Universidad de las Fuerzas Armadas ESPE. (${new Date().getFullYear()}). Oferta académica presencial. https://www.espe.edu.ec/oferta-academica-espe-presencial/`
  ]
};
}
