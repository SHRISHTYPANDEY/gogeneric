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

const getSlotEndTime = (slot) => {
  const endTime = slot.split("-")[1].trim();
  return new Date(`1970-01-01 ${endTime}`);
};

const getNumericPrice = (price) => {
  if (typeof price === "number") return price;
  return Number(price.replace(/[^0-9]/g, ""));
};

export default function BookAppointment({ phone, planName, planPrice }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [showPayNow, setShowPayNow] = useState(false);

  const now = new Date();
  const numericPrice = getNumericPrice(planPrice);

  const isSlotDisabled = (slot) => {
    if (selectedDate !== "today") return false;

    const slotEnd = getSlotEndTime(slot);
    const currentTime = new Date(
      `1970-01-01 ${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })}`
    );

    return currentTime > slotEnd;
  };

  const handleWhatsAppBooking = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date & time slot");
      return;
    }

    const dateText = selectedDate === "today" ? "Today" : "Tomorrow";

    const message = `Hello Doctor
I want to book an appointment.

📌 Plan: ${planName}
💰 Price: ₹${numericPrice}
📅 Date: ${dateText}
⏰ Time Slot: ${selectedSlot}

Please confirm the appointment.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setShowPayNow(true);
  };

  const handlePayNow = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date & time slot");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: numericPrice * 100, 
      currency: "INR",
      name: "Doctor Appointment",
      description: `${planName} - ₹${numericPrice}`,
      handler: function (response) {
        alert(
          `Payment Successful!\nPlan: ${planName}\nAmount: ₹${numericPrice}\nPayment ID: ${response.razorpay_payment_id}`
        );
      },
      prefill: {
        contact: phone,
      },
      theme: {
        color: "#0d6efd",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="booking-container">

      <div className="section">
        <h4>Select Date</h4>
        <div className="options-row">
          {DATE_OPTIONS.map((d) => (
            <button
              key={d.value}
              className={`option-btn ${selectedDate === d.value ? "active" : ""}`}
              onClick={() => {
                setSelectedDate(d.value);
                setSelectedSlot("");
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h4>Select Time Slot</h4>
        <div className="slots-grid">
          {TIME_SLOTS.map((slot) => {
            const disabled = isSlotDisabled(slot);

            return (
              <button
                key={slot}
                disabled={disabled}
                className={`slot-btn ${selectedSlot === slot ? "active" : ""} ${
                  disabled ? "disabled" : ""
                }`}
                onClick={() => !disabled && setSelectedSlot(slot)}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button className="book-btn" onClick={handleWhatsAppBooking}>
        Book Appointment
      </button>

      {showPayNow && (
        <button className="pay-btn" onClick={handlePayNow}>
          Pay ₹{numericPrice}
        </button>
      )}
    </div>
  );
}
