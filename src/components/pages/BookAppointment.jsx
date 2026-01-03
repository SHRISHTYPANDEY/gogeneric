import React, { useState } from "react";
import "./BookAppointment.css";

const DATE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" }
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM"
];

export default function BookAppointment({
  phone,
  planName,
  planPrice
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [showPayNow, setShowPayNow] = useState(false);

  const handleWhatsAppBooking = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date & time slot");
      return;
    }

    const dateText =
      selectedDate === "today" ? "Today" : "Tomorrow";

    const message = `Hello Doctor
I want to book an appointment.

📌 Plan: ${planName}
💰 Price: ${planPrice}
📅 Date: ${dateText}
⏰ Time Slot: ${selectedSlot}

Please confirm the appointment.`;

    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, "_blank");
    setShowPayNow(true);
  };

  return (
    <div className="booking-container">
      
      {/* Date Selection */}
      <div className="section">
        <h4>Select Date</h4>
        <div className="options-row">
          {DATE_OPTIONS.map((d) => (
            <button
              key={d.value}
              className={`option-btn ${
                selectedDate === d.value ? "active" : ""
              }`}
              onClick={() => setSelectedDate(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="section">
        <h4>Select Time Slot</h4>
        <div className="slots-grid">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              className={`slot-btn ${
                selectedSlot === slot ? "active" : ""
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <button className="book-btn" onClick={handleWhatsAppBooking}>
        Book Appointment
      </button>

      {showPayNow && (
        <button className="pay-btn">
          Pay Now
        </button>
      )}
    </div>
  );
}
