export default function BookAppointment({ phone, whatsapp }) {
  return (
    <div className="booking-options">
      <a href={`tel:+${phone}`} className="option-row call-row">
        <div className="option-icon">📞</div>
        <div className="option-info">
          <span className="option-title">Phone Call</span>
          <span className="option-subtitle">Speak with the doctor directly</span>
        </div>
        <div className="arrow-right">→</div>
      </a>

      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="option-row whatsapp-row"
      >
        <div className="option-icon">💬</div>
        <div className="option-info">
          <span className="option-title">WhatsApp Chat</span>
          <span className="option-subtitle">Message for quick queries</span>
        </div>
        <div className="arrow-right">→</div>
      </a>
    </div>
  );
}