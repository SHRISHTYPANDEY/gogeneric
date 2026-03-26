import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { bookAppointment } from "../../api/doctorApi";
import { openRazorpay } from "../../utils/razorpayPayment";
import "./BookAppointment.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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
  return Number(price.replace(/[^0-9]/g, "")) || 0;
};

export default function BookAppointment({
  planName,
  planPrice,
  planId,
  doctorId,
  isApprovedDoctor,
  onClose
}) {
  const { user } = useAuth();

  const [useMyDetails, setUseMyDetails] = useState(true);
  const [patientName, setPatientName] = useState(user?.name || "");
  const [patientPhone, setPatientPhone] = useState(user?.phone || "");
  const [patientAge, setPatientAge] = useState("");
  const [problem, setProblem] = useState("");
  const [previousPatient, setPreviousPatient] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [showPayNow, setShowPayNow] = useState(false);

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

  const handleUseMyDetails = (checked) => {
    setUseMyDetails(checked);
    if (checked) {
      setPatientName(user?.name || "");
      setPatientPhone(user?.phone || "");
    } else {
      setPatientName("");
      setPatientPhone("");
    }
  };

  const handleBookClick = async () => {
    if (!patientName || !patientPhone || !patientAge) {
      alert("Please fill patient details");
      return;
    }

    if (!selectedDate || !selectedSlot) {
      alert("Please select date and time slot");
      return;
    }

    if (!doctorId) {
      alert("Doctor ID is missing");
      return;
    }

    try {
      await bookAppointment({
        doctor_id: doctorId,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_age: patientAge,
        problem: problem,
        previous_patient: previousPatient,
        plan_id: planId,
        plan_name: planName,
        plan_price: numericPrice,
        appointment_date: selectedDate,
        time_slot: selectedSlot
      });
      // console.log("Payload", {
      //   doctor_id: doctorId,
      //   patient_name: patientName,
      //   patient_phone: patientPhone,
      //   patient_age: patientAge,
      //   problem: problem,
      //   previous_patient: previousPatient,
      //   plan_id: planId,
      //   plan_name: planName,
      //   plan_price: numericPrice,
      //   appointment_date: selectedDate,
      //   time_slot: selectedSlot
      // })

      alert("Appointment requested successfully! Waiting for doctor approval.");
      setShowPayNow(false);
      onClose?.();
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error booking appointment. Please try again.");
    }
  };

  const handlePayNow = () => {
    openRazorpay({
      amount: numericPrice * 100,
      name: "Diet Plan Booking",
      description: `${planName} - ₹${numericPrice}`,
      phone: patientPhone || "",
      onSuccess: (response) => {
        alert(
          `Payment Successful!\nPlan: ${planName}\nAmount: ₹${numericPrice}\nPayment ID: ${response.razorpay_payment_id}`
        );
      }
    });
  };

  return (
    <div className="booking-container">
      <div className="section">
        <h4>Patient Details</h4>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={useMyDetails}
            onChange={(e) => handleUseMyDetails(e.target.checked)}
          />
          Book for myself
        </label>

        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="calendar-input"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
          className="calendar-input"
        />

        <input
          type="number"
          placeholder="Age"
          value={patientAge}
          onChange={(e) => setPatientAge(e.target.value)}
          className="calendar-input"
        />

        <textarea
          placeholder="Problem / Symptoms"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="calendar-input"
        />

        <select
          value={previousPatient}
          onChange={(e) => setPreviousPatient(e.target.value)}
          className="calendar-input"
        >
          <option value="">Previous Patient?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

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

      <button className="book-btn" onClick={handleBookClick}>
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