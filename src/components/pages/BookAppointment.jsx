import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { bookAppointment } from "../../api/doctorApi";
import { openRazorpay } from "../../utils/razorpayPayment";
import "./BookAppointment.css";
import Swal from "sweetalert2";
import axios from "axios";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";
const getTodayDate = () => new Date().toISOString().split("T")[0];

const CONSULTATION_TYPES = [
  { value: "in_person", label: "In-Person Session", icon: "🏥", description: "Visit the clinic directly" },
  { value: "video_call", label: "Video Call", icon: "📹", description: "Online video consultation" },
];

const getNumericPrice = (price) => {
  if (typeof price === "number") return Math.round(price);
  return Math.round(Number(price.replace(/[^0-9.]/g, ""))) || 0;
};

// Format date nicely
const fmtDate = (ymd) => {
  const d = new Date(ymd);
  return {
    day:     d.toLocaleDateString("en-IN", { weekday: "short" }),
    date:    d.getDate(),
    month:   d.toLocaleDateString("en-IN", { month: "short" }),
    full:    d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };
};

// Group dates by month
const groupByMonth = (dates) => {
  const groups = {};
  dates.forEach((ymd) => {
    const key = new Date(ymd).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(ymd);
  });
  return groups;
};

export default function BookAppointment({ planName, planPrice, planId, doctorId, clinicAddress, onClose }) {
  const { user } = useAuth();

  const [useMyDetails, setUseMyDetails]         = useState(true);
  const [patientName, setPatientName]           = useState(user?.name || "");
  const [patientPhone, setPatientPhone]         = useState(user?.phone || "");
  const [patientAge, setPatientAge]             = useState("");
  const [problem, setProblem]                   = useState("");
  const [previousPatient, setPreviousPatient]   = useState("");
  const [selectedDate, setSelectedDate]         = useState("");
  const [selectedSlot, setSelectedSlot]         = useState("");
  const [showPayNow, setShowPayNow]             = useState(false);
  const [consultationType, setConsultationType] = useState("in_person");
  const [availableDates, setAvailableDates]     = useState([]);
  const [availableSlots, setAvailableSlots]     = useState([]);
  const [loadingDates, setLoadingDates]         = useState(false);
  const [loadingSlots, setLoadingSlots]         = useState(false);

  const numericPrice = getNumericPrice(planPrice);

  useEffect(() => {
    if (!doctorId) return;
    fetchAvailableDates();
  }, [doctorId]);

  const fetchAvailableDates = async () => {
    setLoadingDates(true);
    try {
      const res = await axios.get(`${BASE_URL}/doctor/${doctorId}/available-dates`);
      setAvailableDates(res.data.available_dates || []);
    } catch (err) {
      console.error("Failed to fetch available dates", err);
    }
    setLoadingDates(false);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setAvailableSlots([]);
    setShowPayNow(false);
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await axios.get(`${BASE_URL}/doctor/${doctorId}/available-slots`, { params: { date } });
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      Swal.fire("Error", "Could not load time slots. Please try again.", "error");
    }
    setLoadingSlots(false);
  };

  const handleUseMyDetails = (checked) => {
    setUseMyDetails(checked);
    if (checked) { setPatientName(user?.name || ""); setPatientPhone(user?.phone || ""); }
    else { setPatientName(""); setPatientPhone(""); }
  };

  const handleConsultationTypeChange = (value) => {
    setConsultationType(value);
    setSelectedDate("");
    setSelectedSlot("");
    setAvailableSlots([]);
    setShowPayNow(false);
  };

  const handleBookClick = async () => {
    if (!patientName || !patientPhone || !patientAge) {
      Swal.fire({ icon: "warning", title: "Missing Details", text: "Please fill patient details" });
      return;
    }
    if (!selectedDate || !selectedSlot) {
      Swal.fire({ icon: "warning", title: "Select Date & Slot", text: "Please select date and time slot" });
      return;
    }
    if (!doctorId) {
      Swal.fire({ icon: "error", title: "Error", text: "Doctor ID is missing" });
      return;
    }
    try {
      await bookAppointment({
        doctor_id: doctorId,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_age: patientAge,
        problem,
        previous_patient: previousPatient,
        plan_id: planId,
        plan_name: planName,
        plan_price: numericPrice,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        consultation_type: consultationType,
      });
      const typeLabel = CONSULTATION_TYPES.find((t) => t.value === consultationType)?.label || consultationType;
      Swal.fire({
        icon: "success",
        title: "Appointment Booked 🎉",
        html: `<b>Consultation:</b> ${typeLabel}<br/>${consultationType === "video_call" ? "Doctor will share video call link before appointment." : ""}`,
        confirmButtonColor: "#10b981",
      });
      onClose?.();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Booking Failed", text: "Error booking appointment. Please try again." });
    }
  };

  const handlePayNow = () => {
    openRazorpay({
      amount: numericPrice * 100,
      name: "Diet Plan Booking",
      description: `${planName} - ₹${numericPrice}`,
      phone: patientPhone || "",
      onSuccess: (response) => {
        Swal.fire({
          icon: "success",
          title: "Payment Successful 💸",
          html: `<b>Plan:</b> ${planName}<br/><b>Amount:</b> ₹${numericPrice}<br/><b>Payment ID:</b> ${response.razorpay_payment_id}`,
        });
      },
    });
  };

  const groupedDates = groupByMonth(availableDates);

  // Slot time period label
  const getSlotPeriod = (slot) => {
    const start = slot.split("-")[0].trim();
    const hour = parseInt(start.split(":")[0]);
    const isPM = start.includes("PM");
    const h24 = isPM && hour !== 12 ? hour + 12 : hour;
    if (h24 < 12) return "Morning";
    if (h24 < 17) return "Afternoon";
    return "Evening";
  };

  const periodIcon = { Morning: "🌅", Afternoon: "☀️", Evening: "🌆" };
  const periodColor = {
    Morning:   { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", activeBg: "#f59e0b", activeText: "#fff" },
    Afternoon: { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", activeBg: "#3b82f6", activeText: "#fff" },
    Evening:   { bg: "#fdf4ff", border: "#d8b4fe", text: "#6b21a8", activeBg: "#9333ea", activeText: "#fff" },
  };

  // Group slots by period
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const period = getSlotPeriod(slot);
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {});

  return (
    <div className="booking-container">

      {/* Consultation Type */}
      <div className="section">
        <h4>Consultation Type</h4>
        <div className="consultation-type-grid">
          {CONSULTATION_TYPES.map((type) => (
            <label key={type.value} className={`consultation-type-card ${consultationType === type.value ? "active" : ""}`}>
              <input type="radio" name="consultationType" value={type.value}
                checked={consultationType === type.value}
                onChange={() => handleConsultationTypeChange(type.value)} />
              <span className="consultation-icon">{type.icon}</span>
              <span className="consultation-label">{type.label}</span>
              <span className="consultation-desc">{type.description}</span>
            </label>
          ))}
        </div>
        {consultationType === "in_person" && clinicAddress && (
          <div className="info-banner info-banner--teal">
            📍 <strong>Clinic Address:</strong> {clinicAddress}
          </div>
        )}
        {consultationType === "video_call" && (
          <div className="info-banner info-banner--blue">
            📹 The doctor will share a video call link before your appointment.
          </div>
        )}
      </div>

      {/* Patient Details */}
      <div className="section">
        <h4>Patient Details</h4>
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={useMyDetails} onChange={(e) => handleUseMyDetails(e.target.checked)} />
          Book for myself
        </label>
        <input type="text" placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="calendar-input" />
        <input type="tel" placeholder="Phone Number" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="calendar-input" />
        <input type="number" placeholder="Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} className="calendar-input" />
        <textarea placeholder="Problem / Symptoms" value={problem} onChange={(e) => setProblem(e.target.value)} className="calendar-input" />
        <select value={previousPatient} onChange={(e) => setPreviousPatient(e.target.value)} className="calendar-input">
          <option value="">Previous Patient?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* ✅ Date — calendar chips grouped by month */}
      <div className="section">
        <h4>Select Date</h4>

        {loadingDates ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 14 }}>
            <span style={{ width: 16, height: 16, border: "2px solid #d1d5db", borderTopColor: "#6b7280", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            Loading available dates...
          </div>
        ) : availableDates.length === 0 ? (
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
            No available dates for this doctor right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(groupedDates).map(([month, dates]) => (
              <div key={month}>
                {/* Month label */}
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  {month}
                </p>
                {/* Date chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {dates.map((ymd) => {
                    const { day, date, month: mon } = fmtDate(ymd);
                    const isSelected = selectedDate === ymd;
                    return (
                      <button
                        key={ymd}
                        onClick={() => handleDateChange(ymd)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #10b981" : "1px solid #e5e7eb",
                          background: isSelected ? "#ecfdf5" : "#fff",
                          cursor: "pointer",
                          minWidth: 56,
                          transition: "all .15s",
                          boxShadow: isSelected ? "0 0 0 3px #d1fae5" : "none",
                        }}
                      >
                        <span style={{ fontSize: 11, color: isSelected ? "#059669" : "#9ca3af", fontWeight: 500 }}>{day}</span>
                        <span style={{ fontSize: 18, fontWeight: 600, color: isSelected ? "#065f46" : "#111827", lineHeight: 1.2 }}>{date}</span>
                        <span style={{ fontSize: 11, color: isSelected ? "#059669" : "#9ca3af" }}>{mon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected date confirmation */}
        {selectedDate && (
          <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
            ✅ <strong>{fmtDate(selectedDate).full}</strong> selected
          </div>
        )}
      </div>

      {/* ✅ Slots — grouped by Morning / Afternoon / Evening */}
      <div className="section">
        <h4>Select Time Slot</h4>

        {!selectedDate ? (
          <div style={{ background: "#f9fafb", border: "1px dashed #d1d5db", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
            Please select a date first
          </div>
        ) : loadingSlots ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 14 }}>
            <span style={{ width: 16, height: 16, border: "2px solid #d1d5db", borderTopColor: "#6b7280", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            Loading slots...
          </div>
        ) : availableSlots.length === 0 ? (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#b91c1c" }}>
            No slots available for this date. Please choose another date.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {["Morning", "Afternoon", "Evening"].map((period) => {
              const slots = groupedSlots[period];
              if (!slots || slots.length === 0) return null;
              const colors = periodColor[period];
              return (
                <div key={period}>
                  {/* Period header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{periodIcon[period]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{period}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>({slots.length} slot{slots.length > 1 ? "s" : ""})</span>
                  </div>
                  {/* Slot chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 10,
                            border: `1.5px solid ${isSelected ? colors.activeBg : colors.border}`,
                            background: isSelected ? colors.activeBg : colors.bg,
                            color: isSelected ? colors.activeText : colors.text,
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            transition: "all .15s",
                            boxShadow: isSelected ? `0 2px 8px ${colors.activeBg}55` : "none",
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected slot confirmation */}
        {selectedSlot && (
          <div style={{ marginTop: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#1e40af", display: "flex", alignItems: "center", gap: 6 }}>
            🕐 <strong>{selectedSlot}</strong> selected
          </div>
        )}
      </div>

      {/* Booking summary before confirm */}
      {selectedDate && selectedSlot && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 12, fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: "#374151" }}>Booking Summary</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "#6b7280" }}>
            <span>📅 {fmtDate(selectedDate).full}</span>
            <span>🕐 {selectedSlot}</span>
            <span>{consultationType === "video_call" ? "📹" : "🏥"} {CONSULTATION_TYPES.find(t => t.value === consultationType)?.label}</span>
            {planName && <span>📋 {planName} — ₹{numericPrice.toLocaleString("en-IN")}</span>}
          </div>
        </div>
      )}

      <button className="book-btn" onClick={handleBookClick}>
        Book Appointment
      </button>

      {showPayNow && (
        <button className="pay-btn" onClick={handlePayNow}>
          Pay ₹{numericPrice.toLocaleString("en-IN")}
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}