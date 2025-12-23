import { useEffect, useState } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

import DeliveryType from "../../components/checkout/Deliverytype";
import DeliveryPreference from "../../components/checkout/DelieveryPrefrence";
import AddressSection from "../../components/checkout/AddressSection";
import PromoCode from "../checkout/_PromoCode";
import TipsSection from "../../components/checkout/TipsSection";
import BillDetails from "../../components/checkout/BillDetails";
import AddressModal from "../../components/checkout/AddressModal";
import PaymentModal from "../../components/checkout/PaymentModal";
import OrderSuccessModal from "../../components/checkout/OrderSuccessModal";
import Prescription from "../orders/Prescription";

export default function Checkout() {
  const navigate = useNavigate();

  /* ---------------- STATES ---------------- */
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [deliveryTime, setDeliveryTime] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

  /* ---------------- PRESCRIPTION CHECK ---------------- */
  const prescriptionRequired = cart.some(
    (item) =>
      item.prescription_required === true ||
      item.prescription_required === 1
  );

  /* ---------------- FETCH CART ---------------- */
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: !token ? { guest_id: guestId } : {},
      });

      setCart(res.data || []);
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () =>
      window.removeEventListener("cart-updated", fetchCart);
  }, []);

  /* ---------------- BILL ---------------- */
  const bill = {
    totalAmount: cart.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    ),
  };

  /* ---------------- ADDRESS ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("selected_address");
    if (saved) setSelectedAddress(JSON.parse(saved));
  }, []);

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    localStorage.setItem("selected_address", JSON.stringify(addr));
    setShowAddressModal(false);
  };

  /* ---------------- VALIDATION ---------------- */
  const isOrderValid = () => {
    const hasOutOfStockItem = cart.some(
  (item) =>
    item.available_stock === 0 ||
    item.is_available === false
);

if (hasOutOfStockItem) {
  toast.error("Remove out of stock items from cart");
  return false;
}

    if (!cart.length) {
      toast.error("Your cart is empty");
      return false;
    }

    if (!selectedAddress) {
      toast.error("Please select delivery address");
      return false;
    }

    if (!deliveryTime) {
      toast.error("Please select delivery time");
      return false;
    }

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return false;
    }

    if (prescriptionRequired && !prescriptionFile) {
      setPrescriptionError("Prescription is required for this order");
      toast.error("Prescription is required for this order");
      return false;
    }

    return true;
  };

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (placingOrder) return;
    if (!isOrderValid()) return;

    setPlacingOrder(true);

    const token = localStorage.getItem("token");
    const guestId = localStorage.getItem("guest_id");
    const storeId = cart[0]?.item?.store_id;

    const payload = {
      order_amount: bill.totalAmount,
      payment_method: "cash_on_delivery",
      order_type: "delivery",
      store_id: storeId,
      distance: Number(selectedAddress.distance) || 1,
      latitude: Number(selectedAddress.latitude) || 28.6139,
      longitude: Number(selectedAddress.longitude) || 77.209,
      address: selectedAddress.address,
      delivery_time_preference: deliveryTime,
      contact_person_name:
        selectedAddress.contact_person_name || "Customer",
      contact_person_number: selectedAddress.phone,
    };

    if (!token && guestId) payload.guest_id = guestId;

    try {
      const res = await api.post(
        "/api/v1/customer/order/place",
        payload,
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const createdOrderId =
        res.data?.order_id || res.data?.data?.order_id;

      if (!createdOrderId) {
        throw new Error("Order ID missing");
      }

      setOrderId(createdOrderId);
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error("❌ Order failed:", err);
      toast.error(
        err?.response?.data?.message || "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) return <div>Loading checkout...</div>;

  return (
    <div className="checkout-page max-w-7xl mx-auto">
      <header className="checkout-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Checkout</h3>
      </header>

      <DeliveryType />

      <DeliveryPreference
        value={deliveryTime}
        onChange={setDeliveryTime}
      />

      <AddressSection
        address={selectedAddress}
        onChange={() => setShowAddressModal(true)}
        onAddNew={() => navigate("/add-address")}
      />

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onSelect={handleAddressSelect}
        />
      )}

      <PromoCode />
      <TipsSection />
      <BillDetails bill={bill} />

      <Prescription
        prescriptionFile={prescriptionFile}
        setPrescriptionFile={setPrescriptionFile}
        prescriptionRequired={prescriptionRequired}
        error={prescriptionError}
        setError={setPrescriptionError}
      />

      <div className="checkout-footer">
        <button
          type="button"
          className="pay-using-btn"
          onClick={() => setShowPaymentModal(true)}
        >
          Pay Using • {paymentMethod}
        </button>

        <button
          type="button"
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={
            placingOrder ||
            !cart.length ||
            !selectedAddress ||
            !deliveryTime ||
            !paymentMethod ||
            (prescriptionRequired && !prescriptionFile)
          }
        >
          {placingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>

      {showPaymentModal && (
        <PaymentModal
          selected={paymentMethod}
          onSelect={(m) => {
            setPaymentMethod(m);
            setShowPaymentModal(false);
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showSuccess && (
        <OrderSuccessModal
          orderId={orderId}
          onClose={() => navigate("/")}
        />
      )}
    </div>
  );
}
