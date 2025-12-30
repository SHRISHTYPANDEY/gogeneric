import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { toast } from "react-hot-toast";
// import api from "../api/axiosInstance";
import "./ContactUs.css";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/v1/contact", {
        name: form.name,
        email: form.email,
        message: form.message,
      });

      toast.success("Message sent successfully ✅");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message ❌");
      console.error("Contact error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page max-w-7xl mx-auto">
      <h2 className="contact-title">Get in touch</h2>
      <p className="contact-sub">
        We'd love to hear from you. Please reach out using the form below.
      </p>

      <div className="contact-wrapper">
        {/* LEFT INFO */}
        <div className="contact-info">
          {/* ADDRESS */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Blossom+Compound+Sahibabad+Ghaziabad"
            target="_blank"
            rel="noopener noreferrer"
            className="info-box clickable"
          >
            <MapPin size={20} />
            <div>
              <h4>Address</h4>
              <p>
                Building No.11/7,8, Blossom Compound, Industrial Area Site 4,
                Sahibabad, Ghaziabad, Uttar Pradesh 201010
              </p>
            </div>
          </a>

          {/* PHONE */}
          <a href="tel:+919211510600" className="info-box clickable">
            <Phone size={20} />
            <div>
              <h4>Phone</h4>
              <p>+91 9211510600</p>
            </div>
          </a>

          {/* EMAIL */}
          <a
            href="mailto:info@gogenericpharma.com"
            className="info-box clickable"
          >
            <Mail size={20} />
            <div>
              <h4>Email</h4>
              <p>info@gogenericpharma.com</p>
            </div>
          </a>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/919211510600"
            target="_blank"
            rel="noopener noreferrer"
            className="info-box clickable whatsapp"
          >
            <Phone size={20} />
            <div>
              <h4>WhatsApp</h4>
              <p>Chat with us on WhatsApp</p>
            </div>
          </a>
        </div>

        {/* RIGHT FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message..."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
      {/* ===== MAP SECTION ===== */}
      <div className="contact-map-section">
        <iframe
          title="GoGeneric Location"
          src="https://www.google.com/maps?q=Blossom+Compound+Industrial+Area+Site+4+Sahibabad+Ghaziabad+201010&output=embed"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
