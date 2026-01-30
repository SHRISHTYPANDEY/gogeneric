import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Home, Briefcase, MapPin } from "lucide-react";
import "./AddressSection.css";
import { useLocation } from "../../../context/LocationContext";
import Swal from "sweetalert2";

export default function AddressForm({
  initialData,
  onClose,
  onSuccess,
  existingAddresses = [],
}) {
  const [addressType, setAddressType] = useState("Home");
  const { location } = useLocation();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    contact_name: "",
    phone: "",
    house: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ------------------ SWEET ALERT HELPERS ------------------ */
  const showAlert = (icon, title, text, timer = null) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#016B61",
      timer,
      showConfirmButton: !timer,
    });
  };

  const confirmSave = async () => {
    const result = await Swal.fire({
      title: initialData ? "Update Address?" : "Save Address?",
      text: "Please confirm the address details",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#016B61",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, continue",
    });

    if (result.isConfirmed) {
      handleSubmit();
    }
  };

  /* ------------------ DUPLICATE CHECK ------------------ */
  const isDuplicateAddress = (finalAddress) => {
    return existingAddresses.some((addr) => {
      if (initialData?.id && addr.id === initialData.id) return false;

      return (
        addr.address?.trim().toLowerCase() ===
          finalAddress.trim().toLowerCase() &&
        addr.address_type === addressType
      );
    });
  };

  /* ------------------ PREFILL (EDIT MODE) ------------------ */
  useEffect(() => {
    if (initialData) {
      setAddressType(initialData.address_type || "Home");

      const parts = initialData.address?.split(",") || [];

      setForm({
        contact_name: initialData.contact_person_name || "",
        phone: initialData.contact_person_number || "",
        house: parts[0]?.trim() || "",
        area: parts[1]?.trim() || "",
        landmark: parts[2]?.trim() || "",
        city: parts[3]?.trim() || "",
        state: parts[4]?.trim() || "",
        pincode: parts[5]?.trim() || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async () => {
    if (!location?.lat || !location?.lng) {
      showAlert(
        "warning",
        "Location Required",
        "Select delivery location from top first"
      );
      return;
    }

    if (!form.contact_name || !form.phone || !form.house || !form.area) {
      showAlert(
        "error",
        "Missing Details",
        "Please fill all required fields"
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      showAlert(
        "error",
        "Invalid Phone",
        "Please enter a valid 10 digit mobile number"
      );
      return;
    }

    const address = [
      form.house,
      form.area,
      form.landmark,
      form.city,
      form.state,
      form.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    if (isDuplicateAddress(address)) {
      showAlert(
        "info",
        "Duplicate Address",
        "This address already exists"
      );
      return;
    }

    const payload = {
      contact_person_name: form.contact_name,
      contact_person_number: form.phone,
      address_type: addressType,
      address,
      latitude: location.lat,
      longitude: location.lng,
    };

    try {
      if (initialData?.id) {
        await api.put(
          `/api/v1/customer/address/update/${initialData.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showAlert("success", "Updated", "Address updated successfully", 1500);
      } else {
        await api.post("/api/v1/customer/address/add", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        showAlert("success", "Saved", "Address added successfully", 1500);
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Address save error", err);
      showAlert("error", "Failed", "Failed to save address");
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="address-form">
      <h4>{initialData ? "Edit Address" : "Add New Address"}</h4>

      {/* ADDRESS TYPE */}
      <div className="address-type-row">
        <button
          className={`type-btn ${addressType === "Home" ? "active" : ""}`}
          onClick={() => setAddressType("Home")}
        >
          <Home size={16} /> Home
        </button>

        <button
          className={`type-btn ${addressType === "Office" ? "active" : ""}`}
          onClick={() => setAddressType("Office")}
        >
          <Briefcase size={16} /> Office
        </button>

        <button
          className={`type-btn ${addressType === "Other" ? "active" : ""}`}
          onClick={() => setAddressType("Other")}
        >
          <MapPin size={16} /> Other
        </button>
      </div>

      {/* CONTACT */}
      <input
        name="contact_name"
        placeholder="Contact Name"
        value={form.contact_name}
        onChange={handleChange}
      />
      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
      />

      {/* ADDRESS */}
      <input
        name="house"
        placeholder="House / Flat / Floor"
        value={form.house}
        onChange={handleChange}
      />
      <input
        name="area"
        placeholder="Street / Area"
        value={form.area}
        onChange={handleChange}
      />
      <input
        name="landmark"
        placeholder="Landmark (optional)"
        value={form.landmark}
        onChange={handleChange}
      />

      <div className="two-col">
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />
        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
        />
      </div>

      <input
        name="pincode"
        placeholder="Pincode"
        value={form.pincode}
        onChange={handleChange}
      />

      <div className="form-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={confirmSave}>
          {initialData ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
