import "./BlogCTA.css";

export default function BlogCTA({
  title = "Need Medicines Fast & Safe?",
  description = "Order genuine medicines from the GoGeneric Healthcare App and get doorstep delivery with complete safety.",
  phone = "+919211510600",
  whatsapp = "919211510600",
}) {
  return (
    <section className="blog-cta">
      <div className="cta-content">
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="cta-buttons">
          <a href={`tel:${phone}`} className="cta-btn call">
            📞 Call Now
          </a>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn whatsapp"
          >
            💬 WhatsApp Chat
          </a>
        </div>
      </div>
    </section>
  );
}
