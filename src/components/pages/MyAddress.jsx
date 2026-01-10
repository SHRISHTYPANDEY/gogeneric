import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import AddressForm from "./checkout/AddressForm";
import "./MyAddress.css";
import { useLocation } from "../../context/LocationContext";
export default function MyAddress() {
  const { location, addressVersion } = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/customer/address/list");
      setAddresses(res.data.addresses || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location) return;
    fetchAddresses();
  }, [location, addressVersion]);

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedAddress(null);
    setShowForm(true);
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      await api.delete(`/api/v1/customer/address/delete?address_id=${id}`);
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const isDuplicateAddress = (newAddress, excludeId = null) => {
    return addresses.some((addr) => {
      if (excludeId && addr.id === excludeId) return false;

      return (
        addr.address.trim().toLowerCase() ===
          newAddress.address.trim().toLowerCase() &&
        addr.address_type === newAddress.address_type
      );
    });
  };

  return (
    <div className="myaddress-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 className="page-title">My Addresses</h1>

        <button
          onClick={handleAddNew}
          style={{
            padding: "12px 20px",
            borderRadius: "50px",
            background: "#6B3F69",
            color: "#fff",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          + Add New Address
        </button>
      </div>

      {loading && <Loader text="Loading addresses..." />}

      {!loading && addresses.length === 0 && <p>No saved addresses</p>}

      {!loading && (
        <div className="address-grid">
          {addresses.map((addr) => (
            <div className="address-card" key={addr.id}>
              <div className="address-header">
                <h3>{addr.address_type}</h3>
                {addr.is_default && (
                  <span className="default-badge">Default</span>
                )}
              </div>

              <p className="address-text">{addr.address}</p>

              <div className="address-actions">
                <button onClick={() => handleEdit(addr)}>Edit</button>
                <button onClick={() => deleteAddress(addr.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <AddressForm
              initialData={selectedAddress}
              existingAddresses={addresses}
              onClose={() => {
                setShowForm(false);
                setSelectedAddress(null);
              }}
              onSuccess={() => {
                setShowForm(false);
                setSelectedAddress(null);
                fetchAddresses();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
