import { useState } from "react";
import "./Faq.css";

export default function FAQ({ faqs }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>

      <div className="faq-card">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
          >
            <button
              className="faq-question"
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
            >
              <span>{faq.question}</span>
              <span className="icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>

            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
