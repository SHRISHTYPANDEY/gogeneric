import React, { useState } from "react";
import "./BookAppointment.css";
import { openRazorpay } from "../../utils/razorpayPayment";

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};


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
  if (!selectedDate) return true;

  const today = getTodayDate();
  if (selectedDate !== today) return false;

  const slotEnd = getSlotEndTime(slot);
  const now = new Date(
    `1970-01-01 ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })}`
  );

  return now > slotEnd;
};


  const handleWhatsAppBooking = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date & time slot");
      return;
    }

    const dateText = new Date(selectedDate).toDateString();


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

  openRazorpay({
    amount: numericPrice,
    name: "Doctor Appointment",
    description: `${planName} - ₹${numericPrice}`,
    phone,
    onSuccess: (response) => {
      alert(
        `Payment Successful!
Plan: ${planName}
Amount: ₹${numericPrice}
Payment ID: ${response.razorpay_payment_id}`
      );
    },
  });
};
  return (
    <div className="booking-container">

      <div className="section">
  <h4>Select Date</h4>
  <input
    type="date"
    className="calendar-input"
    value={selectedDate}
    min={getTodayDate()}   
    onChange={(e) => {
      setSelectedDate(e.target.value);
      setSelectedSlot("");
      setShowPayNow(false);
    }}
  />
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
