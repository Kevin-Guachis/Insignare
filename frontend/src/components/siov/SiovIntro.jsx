export default function SiovIntro({ onContinue,content }) { return (<div id="screen-intro">
    <div className="intro-panel mb-4">
      <span className="scope-badge">📋 Instrucciones del Test</span>
      <h2 className="font-display">Bienvenido/a al SIOV</h2>
      <p className="siov-static-1">
        El <strong>Sistema Inteligente de Orientación Vocacional (SIOV)</strong> es un instrumento psicométrico diseñado 
        y aplicado por el <strong>Instituto Politécnico Insignare</strong> con el propósito de orientarte en la elección 
        de tu carrera universitaria. A través del análisis de tus intereses y preferencias, el SIOV identifica las áreas 
        vocacionales con las que presentas mayor afinidad, brindándote información objetiva y personalizada que complementa 
        —mas no reemplaza— el acompañamiento de un orientador profesional.
      </p>
      <div className="scope-grid">
        <div className="scope-item">
          <strong>{content.questions.length} preguntas</strong>
          Ítems cerrados de respuesta dicotómica: Sí / No
        </div>
        <div className="scope-item">
          <strong>{Object.keys(content.AREAS).length} áreas vocacionales</strong>
          Arte, Sociales, Económica, Ciencia y Salud
        </div>
        <div className="scope-item">
          <strong>~20 minutos</strong>
          Tiempo estimado para completar el test
        </div>
        <div className="scope-item">
          <strong>Informe personalizado</strong>
          PDF descargable con resultados y oferta académica
        </div>
      </div>

      <div className="intro-warning">
        ⚠️ <strong>Antes de comenzar:</strong> Busca un lugar tranquilo, libre de distracciones, donde puedas responder 
        con calma y sinceridad. No existen respuestas correctas ni incorrectas; lo importante es que cada respuesta 
        refleje genuinamente tu interés personal, independientemente de opiniones externas.
      </div>
    </div>

    <div className="card-panel mb-4">
      <h4 className="font-display mb-3 siov-static-2" >📐 Alcance del Test SIOV</h4>
      <p className="text-muted siov-static-3" >
        El SIOV <strong>mide el nivel de afinidad vocacional</strong> del estudiante en cinco grandes áreas del conocimiento, 
        mediante {[...new Set(Object.values(content.AREAS).map(a=>a.preguntas.length))].join("/")} preguntas por área ({content.questions.length} en total). Cada ítem describe una actividad o situación concreta; 
        tú debes indicar si te interesa o no. El sistema calcula un porcentaje de afinidad por área y genera 
        un perfil comparativo que sirve de base para orientar tu decisión de carrera.
      </p>
      <div className="row g-3">
        <div className="col-md-6">
          <h6 className="fw-bold siov-static-4" >✅ Este test evalúa:</h6>
          <ul className="text-muted siov-static-5" >
            <li>Intereses y preferencias vocacionales por área temática</li>
            <li>Afinidad hacia actividades académicas y profesionales</li>
            <li>Perfil comparativo entre cinco áreas del conocimiento</li>
            <li>Coherencia entre intereses y oferta universitaria local</li>
          </ul>
        </div>
        <div className="col-md-6">
          <h6 className="fw-bold siov-static-6" >⛔ Este test NO evalúa:</h6>
          <ul className="text-muted siov-static-7" >
            <li>Aptitudes, inteligencia ni capacidades cognitivas</li>
            <li>Rendimiento académico ni habilidades específicas</li>
            <li>Personalidad ni rasgos psicológicos profundos</li>
            <li>Garantía de éxito en una carrera determinada</li>
          </ul>
        </div>
      </div>
      <div className="alert mt-3 mb-0 siov-static-8" >
        💡 <strong>Recomendación:</strong> Los resultados de este instrumento deben complementarse con orientación 
        vocacional personalizada, conversaciones con profesionales en ejercicio y exploración directa de la 
        oferta académica de las universidades de tu interés.
      </div>
    </div>

    <div className="d-flex justify-content-end mb-2">
      <button id="btn-ir-datos" onClick={onContinue} className="btn btn-brand px-5 py-3 fs-5">
        Comenzar → Completar mis datos
      </button>
    </div>
  </div>

  ); }
