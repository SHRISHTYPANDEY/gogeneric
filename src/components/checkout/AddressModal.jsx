import { X, MapPin, Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddressModal.css";

export default function AddressModal({ onClose, onSelect }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("address_list")) || [];
    setAddresses(saved);
  }, []);

  return (
    <div className="address-modal-overlay max-w-7xl mx-auto px-4 py-3">
      <div className="address-modal">

        <div className="modal-header">
          <h3>Select Delivery Address</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="address-list">
          {addresses.map((item) => (
            <div
              key={item.id}
              className="address-item"
              onClick={() => {
                localStorage.setItem(
                  "selected_address",
                  JSON.stringify(item)
                );
                localStorage.setItem(
                  "userLocation",
                  item.address
                );
                onSelect(item);
              }}
            >
              <MapPin size={18} />
              <div>
                <p className="label">{item.label}</p>
                <p className="text">{item.address}</p>
              </div>
              <Check size={18} />
            </div>
          ))}
        </div>

        <button
          className="add-new-address"
          onClick={() => navigate("/add-address")}
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>
    </div>
  );
}
