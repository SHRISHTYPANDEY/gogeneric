import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import { Home, Briefcase, MapPin } from "lucide-react";
import "./AddressSection.css"
import { useLocation } from "../../../context/LocationContext";

export default function AddressForm({ initialData, onClose, onSuccess,existingAddresses = [],
 }) {

  const isDuplicateAddress = (finalAddress) => {
  return existingAddresses.some((addr) => {
    // Edit mode me same address ko ignore karo
    if (initialData?.id && addr.id === initialData.id) return false;

    return (
      addr.address?.trim().toLowerCase() ===
        finalAddress.trim().toLowerCase() &&
      addr.address_type === addressType
    );
  });
};

  const [addressType, setAddressType] = useState("Home");

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

  const token = localStorage.getItem("token");
const { location } = useLocation();

  // ✅ PREFILL (EDIT MODE)
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

  const handleSubmit = async () => {
  if (!location?.lat || !location?.lng) {
    toast.error("Select delivery location from top first");
    return;
  }

  if (!form.contact_name || !form.phone || !form.house || !form.area) {
    toast.error("Please fill all required fields");
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
  toast.error("This address already exists");
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
      toast.success("Address updated");
    } else {
      await api.post(
        "/api/v1/customer/address/add",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Address added");
    }

    onSuccess();
  } catch (err) {
    console.error("Address save error", err);
    toast.error("Failed to save address");
  }
};
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
      <input name="contact_name" placeholder="Contact Name" value={form.contact_name} onChange={handleChange} />
      <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />

      {/* ADDRESS */}
      <input name="house" placeholder="House / Flat / Floor" value={form.house} onChange={handleChange} />
      <input name="area" placeholder="Street / Area" value={form.area} onChange={handleChange} />
      <input name="landmark" placeholder="Landmark (optional)" value={form.landmark} onChange={handleChange} />

      <div className="two-col">
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
      </div>

      <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />

      <div className="form-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit}>{initialData ? "Update" : "Save"}</button>
      </div>
    </div>
  );
}
