import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import AddressForm from "./AddressForm";
import "./AddressSection.css";

export default function AddressSection({ deliveryType, onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
  if (deliveryType === "delivery") {
    fetchAddresses();
  } else {
    setAddresses([]);
    setSelectedId(null);
  }
}, [deliveryType]);


  const fetchAddresses = async () => {
    try {
      const res = await api.get("/api/v1/customer/address/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.addresses || [];
      setAddresses(list);
      console.log("Address List", list)
      const def = list.find((a) => a.is_default);
      if (def) {
        setSelectedId(def.id);
        onSelect(def);
      }
    } catch {
      toast.error("Failed to load addresses");
    }
  };

  const handleAddNew = () => {
    const lat = localStorage.getItem("latitude");
const lng = localStorage.getItem("longitude");

if (!lat || !lng) {
  toast.error("Please select delivery location first");
  return;
}


    setEditingAddress(null);
    setShowForm(true);
  };

  if (deliveryType === "takeaway") return null;

  return (
    <div className="checkout-card">
      <h4>Delivery Address</h4>

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`address-card ${selectedId === addr.id ? "active" : ""}`}
          onClick={() => {
            setSelectedId(addr.id);
            onSelect(addr);
          }}
        >
          <div>
            <strong>{addr.address_type}</strong>
            <p>{addr.address}</p>
            <p>📞 {addr.contact_person_number}</p>
          </div>

          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAddress(addr);
              setShowForm(true);
            }}
          >
            Edit
          </button>
        </div>
      ))}

      <button className="add-address-btn" onClick={handleAddNew}>
        + Add New Address
      </button>

      {showForm && (
        <AddressForm
          initialData={editingAddress}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchAddresses();
          }}
        />
      )}
    </div>
  );
}
