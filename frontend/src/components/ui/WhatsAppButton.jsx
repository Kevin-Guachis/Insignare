import { siteConfig } from "../../config/siteConfig";

function WhatsAppButton() {
  const { phone, message } = siteConfig.whatsapp;
  const content = (
    <>
      <span className="whatsapp-contact__text">¿Cómo puedo ayudarte?</span>
      <span className="whatsapp-contact__circle" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
          <path d="M7 26 3 29l1.7-6A12 12 0 1 1 7 26Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 9c-2 1-2 4 1 8s7 6 9 3l-3-3-2 1c-2-1-3-3-4-5l1-1-2-3Z" fill="currentColor" />
        </svg>
      </span>
    </>
  );

  return phone ? (
    <a className="whatsapp-contact" href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="¿Cómo puedo ayudarte? Abrir WhatsApp">
      {content}
    </a>
  ) : (
    <button className="whatsapp-contact" type="button" disabled aria-label="¿Cómo puedo ayudarte? WhatsApp no disponible">
      {content}
    </button>
  );
}

export default WhatsAppButton;
