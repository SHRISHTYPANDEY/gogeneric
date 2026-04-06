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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const ACTIVITY_LEVELS = [
  { value: "", label: "Select Activity Level" },
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "lightly_active", label: "Lightly Active (1–3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (3–5 days/week)" },
  { value: "very_active", label: "Very Active (6–7 days/week)" },
  { value: "extra_active", label: "Extra Active (physical job + exercise)" },
];
const DIET_TYPES = [
  { value: "", label: "Select Diet Type" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "jain", label: "Jain" },
];
const MEDICAL_CONDITIONS = [
  "Diabetes (Type 1)",
  "Diabetes (Type 2)",
  "Hypertension",
  "Thyroid (Hypo)",
  "Thyroid (Hyper)",
  "PCOS/PCOD",
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Asthma",
  "Arthritis",
  "Cholesterol",
  "Anaemia",
  "None",
];
const ALLERGIES = [
  "Gluten", "Dairy/Lactose", "Nuts", "Soy", "Eggs", "Shellfish", "Fish", "None",
];

const getNumericPrice = (price) => {
  if (typeof price === "number") return Math.round(price);
  return Math.round(Number(price.replace(/[^0-9.]/g, ""))) || 0;
};

const fmtDate = (ymd) => {
  const d = new Date(ymd);
  return {
    day:   d.toLocaleDateString("en-IN", { weekday: "short" }),
    date:  d.getDate(),
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    full:  d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  };
};

const groupByMonth = (dates) => {
  const groups = {};
  dates.forEach((ymd) => {
    const key = new Date(ymd).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(ymd);
  });
  return groups;
};

// BMI calculator helper
const calcBMI = (weight, height) => {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h || h === 0) return null;
  const bmi = (w / (h * h)).toFixed(1);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi, category };
};

export default function BookAppointment({ planName, planPrice, planId, doctorId, clinicAddress, onClose }) {
  const { user } = useAuth();

  // — Basic
  const [useMyDetails, setUseMyDetails]         = useState(true);
  const [patientName, setPatientName]           = useState(user?.name || "");
  const [patientPhone, setPatientPhone]         = useState(user?.phone || "");
  const [patientEmail, setPatientEmail]         = useState(user?.email || "");
  const [patientAge, setPatientAge]             = useState("");
  const [gender, setGender]                     = useState("");

  // — Body metrics
  const [weight, setWeight]                     = useState("");       // kg
  const [height, setHeight]                     = useState("");       // cm

  // — Medical history
  const [bloodGroup, setBloodGroup]             = useState("");
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [allergies, setAllergies]               = useState([]);
  const [currentMedications, setCurrentMedications] = useState("");
  const [previousSurgeries, setPreviousSurgeries]   = useState("");

  // — Lifestyle
  const [activityLevel, setActivityLevel]       = useState("");
  const [dietType, setDietType]                 = useState("");
  const [waterIntake, setWaterIntake]           = useState("");       // litres/day
  const [sleepHours, setSleepHours]             = useState("");       // hrs/day
  const [smokingStatus, setSmokingStatus]       = useState("");
  const [alcoholStatus, setAlcoholStatus]       = useState("");

  // — Chief complaint / goals
  const [problem, setProblem]                   = useState("");
  const [healthGoal, setHealthGoal]             = useState("");
  const [previousPatient, setPreviousPatient]   = useState("");

  // — Booking
  const [selectedDate, setSelectedDate]         = useState("");
  const [selectedSlot, setSelectedSlot]         = useState("");
  const [showPayNow, setShowPayNow]             = useState(false);
  const [consultationType, setConsultationType] = useState("in_person");
  const [availableDates, setAvailableDates]     = useState([]);
  const [availableSlots, setAvailableSlots]     = useState([]);
  const [loadingDates, setLoadingDates]         = useState(false);
  const [loadingSlots, setLoadingSlots]         = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  const numericPrice = getNumericPrice(planPrice);
  const bmiData = weight && height ? calcBMI(weight, height) : null;

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
      // console.error("Failed to fetch available dates", err);
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
    if (checked) {
      setPatientName(user?.name || "");
      setPatientPhone(user?.phone || "");
      setPatientEmail(user?.email || "");
    } else {
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
    }
  };

  const handleConsultationTypeChange = (value) => {
    setConsultationType(value);
    setSelectedDate("");
    setSelectedSlot("");
    setAvailableSlots([]);
    setShowPayNow(false);
  };

  const toggleArrayItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const handleBookClick = async () => {
    if (!patientName || !patientPhone || !patientAge || !gender) {
      Swal.fire({ icon: "warning", title: "Missing Details", text: "Please fill all required patient details (Name, Phone, Age, Gender)." });
      return;
    }
    if (!weight) {
      Swal.fire({ icon: "warning", title: "Missing Body Metrics", text: "Weight and height are required." });
      return;
    }
    if (!selectedDate || !selectedSlot) {
      Swal.fire({ icon: "warning", title: "Select Date & Slot", text: "Please select a date and time slot." });
      return;
    }
    if (!doctorId) {
      Swal.fire({ icon: "error", title: "Error", text: "Doctor ID is missing." });
      return;
    }

    try {
    const res = await bookAppointment({
  doctor_id: doctorId,
  patient_name: patientName,
  patient_phone: patientPhone,
  patient_email: patientEmail,
  patient_age: patientAge,
  gender,

  weight_kg: weight,
  height_cm: height,
  bmi: bmiData?.bmi || null,

  blood_group: bloodGroup,
  medical_conditions: medicalConditions,
  allergies,
  current_medications: currentMedications,
  previous_surgeries: previousSurgeries,

  activity_level: activityLevel,
  diet_type: dietType,
  water_intake_litres: waterIntake,
  sleep_hours: sleepHours,
  smoking_status: smokingStatus,
  alcohol_status: alcoholStatus,

  problem,
  health_goal: healthGoal,
  previous_patient: previousPatient === "yes" ? 1 : 0,

  plan_id: planId,
  plan_name: planName,
  plan_price: numericPrice,
  appointment_date: selectedDate,
  time_slot: selectedSlot,
  consultation_type: consultationType,
});
// console.log("Previous Patient State:", previousPatient);

if (!res || !res.appointment_id) {
  throw new Error("Invalid response");
}

setAppointmentId(res.appointment_id);
setShowPayNow(true);

Swal.fire({
  icon: "success",
  title: "Appointment Booked",
  text: "Please complete payment to confirm",
});
    } catch (err) {
      Swal.fire({ icon: "error", title: "Booking Failed", text: "Error booking appointment. Please try again." });
    }
  };
  // console.log("Sending:", previousPatient === "yes" ? 1 : 0);

  const handlePayNow = () => {
    openRazorpay({
      amount: numericPrice ,
      name: "Doctor Appointment",
      description: `${planName} - ₹${numericPrice}`,
      phone: patientPhone || "",
      onSuccess: async (response) => {
  try {
    await axios.post(
      `${BASE_URL}/confirm-payment/${appointmentId}`,
      {
        razorpay_payment_id: response.razorpay_payment_id,
      }
    );

    Swal.fire({
      icon: "success",
      title: "Payment Successful 💸",
      text: "Appointment Confirmed!",
    });

    onClose?.();
  } catch (err) {
    Swal.fire("Error", "Payment saved failed", "error");
  }
},
    });
  };

  const groupedDates = groupByMonth(availableDates);

  const getSlotPeriod = (slot) => {
    const start = slot.split("-")[0].trim();
    const hour = parseInt(start.split(":")[0]);
    const isPM = start.includes("PM");
    const h24 = isPM && hour !== 12 ? hour + 12 : hour;
    if (h24 < 12) return "Morning";
    if (h24 < 17) return "Afternoon";
    return "Evening";
  };

  const periodIcon  = { Morning: "🌅", Afternoon: "☀️", Evening: "🌆" };
  const periodColor = {
    Morning:   { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", activeBg: "#f59e0b", activeText: "#fff" },
    Afternoon: { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", activeBg: "#3b82f6", activeText: "#fff" },
    Evening:   { bg: "#fdf4ff", border: "#d8b4fe", text: "#6b21a8", activeBg: "#9333ea", activeText: "#fff" },
  };

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const period = getSlotPeriod(slot);
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {});

  /* ─── Reusable sub-styles ─── */
  const inputStyle = { className: "calendar-input" };
  const chipBase = {
    display: "inline-block", padding: "6px 12px", borderRadius: 20,
    fontSize: 12, cursor: "pointer", border: "1.5px solid #e5e7eb",
    background: "#f9fafb", color: "#374151", transition: "all .15s", margin: "3px",
  };
  const chipActive = {
    background: "#ecfdf5", border: "1.5px solid #10b981", color: "#065f46", fontWeight: 600,
  };

  return (
    <div className="booking-container">

      {/* ── Consultation Type ── */}
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
          <div className="info-banner info-banner--teal">📍 <strong>Clinic Address:</strong> {clinicAddress}</div>
        )}
        {consultationType === "video_call" && (
          <div className="info-banner info-banner--blue">📹 The doctor will share a video call link before your appointment.</div>
        )}
      </div>

      {/* ── 1. Basic Patient Details ── */}
      <div className="section">
        <h4>👤 Patient Details</h4>

        <label className="flex items-center gap-2 mb-3" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={useMyDetails} onChange={(e) => handleUseMyDetails(e.target.checked)} />
          <span style={{ fontSize: 13 }}>Book for myself</span>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input type="text" placeholder="Patient Name *" value={patientName}
            onChange={(e) => setPatientName(e.target.value)} className="calendar-input" style={{ gridColumn: "1/-1" }} />
          <input type="tel" placeholder="Phone Number *" value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)} className="calendar-input" />
          <input type="email" placeholder="Email (optional)" value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)} className="calendar-input" />
          <input type="number" placeholder="Age (years) *" min={1} max={120} value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)} className="calendar-input" />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="calendar-input">
            <option value="">Gender *</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <select value={previousPatient} onChange={(e) => setPreviousPatient(e.target.value)}
          className="calendar-input" style={{ marginTop: 10 }}>
          <option value="">Previous Patient?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* ── 2. Body Metrics ── */}
      <div className="section">
        <h4>⚖️ Body Metrics</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <input type="number" placeholder="Weight *" min={1} value={weight}
              onChange={(e) => setWeight(e.target.value)} className="calendar-input" style={{ paddingRight: 40 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af" }}>kg</span>
          </div>
          <div style={{ position: "relative" }}>
            <input type="number" placeholder="Height (optional)" min={50} value={height}
              onChange={(e) => setHeight(e.target.value)} className="calendar-input" style={{ paddingRight: 40 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af" }}>cm</span>
          </div>
        </div>

        {/* Live BMI card */}
        {bmiData && (
          <div style={{
            marginTop: 10, background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "#15803d" }}>
              📊 BMI: <strong>{bmiData.bmi}</strong>
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: bmiData.category === "Normal" ? "#d1fae5" : bmiData.category === "Underweight" ? "#fef9c3" : "#fee2e2",
              color: bmiData.category === "Normal" ? "#065f46" : bmiData.category === "Underweight" ? "#92400e" : "#b91c1c",
            }}>
              {bmiData.category}
            </span>
          </div>
        )}
      </div>

      {/* ── 3. Medical History ── */}
      <div className="section">
        <h4>🩺 Medical History</h4>

        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="calendar-input">
          <option value="">Blood Group (optional)</option>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        {/* Medical Conditions — multi-select chips */}
        <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginTop: 12, marginBottom: 6 }}>
          Existing Conditions (select all that apply)
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {MEDICAL_CONDITIONS.map((cond) => {
            const active = medicalConditions.includes(cond);
            return (
              <button key={cond} type="button"
                onClick={() => toggleArrayItem(medicalConditions, setMedicalConditions, cond)}
                style={{ ...chipBase, ...(active ? chipActive : {}) }}>
                {active ? "✓ " : ""}{cond}
              </button>
            );
          })}
        </div>

        {/* Allergies — multi-select chips */}
        <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginTop: 12, marginBottom: 6 }}>
          Food Allergies / Intolerances
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {ALLERGIES.map((a) => {
            const active = allergies.includes(a);
            return (
              <button key={a} type="button"
                onClick={() => toggleArrayItem(allergies, setAllergies, a)}
                style={{ ...chipBase, ...(active ? chipActive : {}) }}>
                {active ? "✓ " : ""}{a}
              </button>
            );
          })}
        </div>

        <textarea placeholder="Current Medications (if any)" value={currentMedications}
          onChange={(e) => setCurrentMedications(e.target.value)}
          className="calendar-input" rows={2} style={{ marginTop: 10 }} />
        <textarea placeholder="Previous Surgeries / Injuries (if any)" value={previousSurgeries}
          onChange={(e) => setPreviousSurgeries(e.target.value)}
          className="calendar-input" rows={2} />
      </div>

      {/* ── 4. Lifestyle ── */}
      <div className="section">
        <h4>🏃 Lifestyle & Diet</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="calendar-input" style={{ gridColumn: "1/-1" }}>
            {ACTIVITY_LEVELS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="calendar-input" style={{ gridColumn: "1/-1" }}>
            {DIET_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <div style={{ position: "relative" }}>
            <input type="number" placeholder="Water intake" min={0} max={10} step={0.5} value={waterIntake}
              onChange={(e) => setWaterIntake(e.target.value)} className="calendar-input" style={{ paddingRight: 50 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af" }}>L/day</span>
          </div>
          <div style={{ position: "relative" }}>
            <input type="number" placeholder="Sleep duration" min={1} max={24} step={0.5} value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)} className="calendar-input" style={{ paddingRight: 50 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9ca3af" }}>hrs/day</span>
          </div>

          <select value={smokingStatus} onChange={(e) => setSmokingStatus(e.target.value)} className="calendar-input">
            <option value="">Smoking?</option>
            <option value="never">Never</option>
            <option value="former">Former smoker</option>
            <option value="occasional">Occasional</option>
            <option value="regular">Regular</option>
          </select>
          <select value={alcoholStatus} onChange={(e) => setAlcoholStatus(e.target.value)} className="calendar-input">
            <option value="">Alcohol?</option>
            <option value="never">Never</option>
            <option value="occasional">Occasional</option>
            <option value="moderate">Moderate</option>
            <option value="regular">Regular</option>
          </select>
        </div>
      </div>

      {/* ── 5. Chief Complaint & Goal ── */}
      <div className="section">
        <h4>📝 Complaint & Health Goal</h4>
        <textarea placeholder="Current Problem / Symptoms" value={problem}
          onChange={(e) => setProblem(e.target.value)} className="calendar-input" rows={3} />
        <textarea placeholder="Health Goal (e.g. lose weight, manage diabetes, build muscle...)" value={healthGoal}
          onChange={(e) => setHealthGoal(e.target.value)} className="calendar-input" rows={2} />
      </div>

      {/* ── Date Picker ── */}
      <div className="section">
        <h4>📅 Select Date</h4>
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
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  {month}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {dates.map((ymd) => {
                    const { day, date, month: mon } = fmtDate(ymd);
                    const isSelected = selectedDate === ymd;
                    return (
                      <button key={ymd} onClick={() => handleDateChange(ymd)} style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "8px 14px", borderRadius: 10, minWidth: 56,
                        border: isSelected ? "2px solid #10b981" : "1px solid #e5e7eb",
                        background: isSelected ? "#ecfdf5" : "#fff", cursor: "pointer",
                        boxShadow: isSelected ? "0 0 0 3px #d1fae5" : "none", transition: "all .15s",
                      }}>
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
        {selectedDate && (
          <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
            ✅ <strong>{fmtDate(selectedDate).full}</strong> selected
          </div>
        )}
      </div>

      {/* ── Time Slot Picker ── */}
      <div className="section">
        <h4>🕐 Select Time Slot</h4>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{periodIcon[period]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{period}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>({slots.length} slot{slots.length > 1 ? "s" : ""})</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
                          padding: "10px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer",
                          border: `1.5px solid ${isSelected ? colors.activeBg : colors.border}`,
                          background: isSelected ? colors.activeBg : colors.bg,
                          color: isSelected ? colors.activeText : colors.text,
                          fontWeight: isSelected ? 600 : 400,
                          boxShadow: isSelected ? `0 2px 8px ${colors.activeBg}55` : "none",
                          transition: "all .15s",
                        }}>
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
        {selectedSlot && (
          <div style={{ marginTop: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#1e40af", display: "flex", alignItems: "center", gap: 6 }}>
            🕐 <strong>{selectedSlot}</strong> selected
          </div>
        )}
      </div>

      {/* ── Booking Summary ── */}
      {selectedDate && selectedSlot && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 12, fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: "#374151" }}>📋 Booking Summary</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "#6b7280" }}>
            <span>👤 {patientName}{patientAge ? `, ${patientAge} yrs` : ""}{gender ? `, ${gender}` : ""}</span>
            {weight && <span>⚖️ {weight} kg | {height} cm{bmiData ? ` | BMI: ${bmiData.bmi} (${bmiData.category})` : ""}</span>}
            <span>📅 {fmtDate(selectedDate).full}</span>
            <span>🕐 {selectedSlot}</span>
            <span>{consultationType === "video_call" ? "📹" : "🏥"} {CONSULTATION_TYPES.find(t => t.value === consultationType)?.label}</span>
            {planName && <span>📋 {planName} — ₹{numericPrice.toLocaleString("en-IN")}</span>}
          </div>
        </div>
      )}

      {!showPayNow ? (
  <button className="book-btn" onClick={handleBookClick}>
    Book Appointment
  </button>
) : null}

      {showPayNow && (
        <button className="pay-btn" onClick={handlePayNow}>
          Pay ₹{numericPrice.toLocaleString("en-IN")}
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}