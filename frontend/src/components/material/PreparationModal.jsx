import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "../../config/siteConfig";
import { showWarning } from "../../utils/alerts";

const options = [
  [
    "university",
    "Universidad",
    ["UCE", "EPN", "ESPE", "ESPOL", "Otra"],
  ],
  [
    "status",
    "Situación académica",
    ["Último año de bachillerato", "Graduado"],
  ],
  [
    "preparation",
    "¿Qué deseas preparar?",
    ["Prueba de admisión", "Examen específico", "Simulador general", "Otro"],
  ],
];

export default function PreparationModal({ onClose }) {
  const dialog = useRef(null);

  const [values, setValues] = useState({
    university: "",
    status: "",
    preparation: "",
    name: "",
  });

  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    const overflow = document.body.style.overflow;

    element.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  function warnInDialog(title, text) {
    return showWarning(title, text, { target: dialog.current });
  }

  function submit(event) {
    event.preventDefault();

    // Validar únicamente los datos necesarios
    if (
      !values.name.trim() ||
      values.name.trim().length > 120 ||
      options.some(
        ([key, , allowed]) => !allowed.includes(values[key])
      )
    ) {
      warnInDialog(
        "Datos incompletos",
        "Completa las opciones y tu nombre."
      );
      return;
    }

    const destination = siteConfig.whatsapp.phone;

    if (!/^[1-9][0-9]{6,14}$/.test(destination || "")) {
      warnInDialog(
        "WhatsApp no disponible",
        "Por favor, comunícate mediante la página de Contacto."
      );
      return;
    }

    // Mensaje con saltos de línea
    const message =
      "Hola, Instituto Politécnico Insignare.\n\n" +
      "Estoy interesado/a en prepararme para la admisión de " +
      values.university +
      ".\n\n" +
      "Mi situación académica es: " +
      values.status +
      ".\n\n" +
      "Me interesa: " +
      values.preparation +
      ".\n\n" +
      "Mi nombre es: " +
      values.name.trim() +
      ".";

    window.open(
      "https://wa.me/" +
        destination +
        "?text=" +
        encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  return createPortal(
    <dialog
      className="material-modal"
      ref={dialog}
      aria-labelledby="material-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="material-modal__panel">
        <header>
          <h2 id="material-modal-title">
            Prepárate con Insignare
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </header>

        <form onSubmit={submit}>
          {options.map(([name, label, choices]) => (
            <label className="material-field" key={name}>
              {label} *

              <select
                required
                value={values[name]}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [name]: e.target.value,
                  })
                }
              >
                <option value="">
                  Selecciona una opción
                </option>

                {choices.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="material-field">
            Nombre *

            <input
              required
              maxLength={120}
              autoComplete="name"
              value={values.name}
              onChange={(e) =>
                setValues({
                  ...values,
                  name: e.target.value,
                })
              }
            />
          </label>

          <p>
            Al continuar se abrirá WhatsApp con tu solicitud
            de información. No se guardan estos datos en este
            sitio.
          </p>

          <button
            type="submit"
            className="material-button"
          >
            Solicitar información
          </button>
        </form>
      </div>
    </dialog>,
    document.body
  );
}
