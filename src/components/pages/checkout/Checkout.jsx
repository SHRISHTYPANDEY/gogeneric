import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import toast from "react-hot-toast";
import "./Checkout.css";
import { useWallet } from "../../../context/WalletContext";
import DeliveryInstructions from "./DeliveryInstructions";
import CartItems from "./CartItems";
import BillSummary from "./BillSummary";
import DeliveryType from "./DeliveryType";
import AddressSection from "./AddressSection";
import PaymentMethod from "./PaymentMethod";
import PrescriptionUpload from "./PrescriptionUpload";
import Loader from "../../Loader";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [instructions, setInstructions] = useState([]);
  const [selectedTip, setSelectedTip] = useState("0");

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const { balance: walletBalance, fetchWallet } = useWallet();

  const [deliveryType, setDeliveryType] = useState(
    localStorage.getItem("delivery_type") || "delivery"
  );
  const orderAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const guestId = localStorage.getItem("guest_id");

  const isPrescriptionRequired = cartItems.some(
    (ci) => ci.item?.is_prescription_required == 1
  );

  // ---------------- FETCH CART ----------------
  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    console.log("CART ITEMS FOR PRESCRIPTION", cartItems);
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: !token ? { guest_id: guestId } : {},
      });
      console.log("Full cartt api response", res);
      const items = res.data || [];
      setCartItems(items);

      if (items.length === 0) navigate("/cart");
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELIVERY TYPE ----------------
  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    localStorage.setItem("delivery_type", type);
  };

  // ---------------- PAYMENT ----------------
  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);

    if (method === "cash_on_delivery" || method === "wallet") {
      setPaymentReady(true);
    } else {
      setPaymentReady(false);
    }
  };

  const handleDigitalPayment = async () => {
    try {
      const res = await api.post(
        "/api/v1/payment/request",
        {
          amount: orderAmount,
          payment_method: "razor_pay",
        },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const paymentId = res.data.payment_id;

      window.location.href = `${
        import.meta.env.VITE_API_BASE_URL
      }/razor-pay?payment_id=${paymentId}`;
    } catch (err) {
      toast.error("Unable to initiate payment");
    }
  };

  const handlePlaceOrder = async () => {
    console.log("SELECTED ADDRESS FULL OBJECT", selectedAddress);

    if (!paymentMethod || !paymentReady) {
      toast.error("Complete payment first");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
      toast.error("Please select delivery address");
      return;
    }

    if (!policyAccepted) {
      toast.error("Please accept policies");
      return;
    }

    if (isPrescriptionRequired && !prescriptionFile) {
      toast.error("Please upload prescription");
      return;
    }

    if (paymentMethod === "digital_payment") {
      return;
    }

    try {
      setPlacingOrder(true);

      const storeId = cartItems?.[0]?.item?.store_id;

      if (paymentMethod === "wallet") {
        if (walletBalance < orderAmount) {
          toast.error(
            `Insufficient wallet balance. Available ₹${walletBalance}`
          );
          setPlacingOrder(false);
          return;
        }
      }

      // ✅ 1. CREATE FORM DATA FIRST
      const formData = new FormData();

      // ✅ 2. APPEND NORMAL FIELDS
      formData.append("order_type", deliveryType);
      formData.append("delivery_type", deliveryType);
      formData.append("payment_method", paymentMethod);
      formData.append("order_amount", orderAmount);
      formData.append("store_id", storeId);

      if (deliveryType === "delivery") {
        formData.append("address_id", selectedAddress.id);
        formData.append("address", selectedAddress.address);
        formData.append("latitude", selectedAddress.latitude);
        formData.append("longitude", selectedAddress.longitude);
        formData.append("distance", selectedAddress.distance || 1);
      }

      if (!token) {
        formData.append("guest_id", guestId);
      }

      // ✅ 3. APPEND PRESCRIPTION AFTER FORM DATA EXISTS
      if (isPrescriptionRequired && prescriptionFile) {
        formData.append("order_attachment", prescriptionFile);
      }

      // 🔍 optional debug (once)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const headers = {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await api.post("/api/v1/customer/order/place", formData, {
        headers,
      });

      toast.success("Order placed successfully 🎉");
      fetchWallet();
      localStorage.removeItem("delivery_type");
      navigate(`/orders/${res.data?.order_id || ""}`);
    } catch (err) {
      console.error("ORDER ERROR", err.response?.data || err);
      toast.error("Order placement failed");
    } finally {
      setPlacingOrder(false);
    }
  };
if (loading) {
  return (
    <div style={{ minHeight: "70vh" }}>
      <Loader />
    </div>
  );
}


  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">
        <div className="checkout-left">
          <CartItems cartItems={cartItems} />

          <DeliveryType
            value={deliveryType}
            onChange={handleDeliveryTypeChange}
          />

          {deliveryType === "delivery" && (
            <AddressSection
              deliveryType={deliveryType}
              onSelect={(addr) => {
                setSelectedAddress(addr);
              }}
            />
          )}

          <DeliveryInstructions
            value={instructions}
            onChange={setInstructions}
            tipValue={selectedTip}
            onTipChange={setSelectedTip}
          />
          {isPrescriptionRequired && (
            <PrescriptionUpload
              required={isPrescriptionRequired}
              file={prescriptionFile}
              onChange={setPrescriptionFile}
            />
          )}

          <PaymentMethod
            value={paymentMethod}
            onChange={handlePaymentSelect}
            walletBalance={walletBalance}
            orderAmount={orderAmount}
          />
          {paymentMethod === "wallet" && (
            <p
              style={{
                marginTop: "8px",
                fontWeight: 500,
                color: walletBalance < orderAmount ? "red" : "green",
              }}
            >
              Wallet Balance: ₹{walletBalance}
              {walletBalance < orderAmount && " (Insufficient balance)"}
            </p>
          )}

          {paymentReady && (
            <p className="payment-success-text">✅ Payment confirmed</p>
          )}
        </div>

        <div className="checkout-right">
          <BillSummary cartItems={cartItems} deliveryType={deliveryType} />
        </div>
      </div>

      <div className="policy-consent">
        <label className="policy-checkbox">
          <input
            type="checkbox"
            checked={policyAccepted}
            onChange={(e) => setPolicyAccepted(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <a href="/privacy-policy" target="_blank">
              Privacy Policy
            </a>
            ,{" "}
            <a href="/terms-and-conditions" target="_blank">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/refund-policy" target="_blank">
              Refund Policy
            </a>
          </span>
        </label>
      </div>

      <button
        className="place-order-btn"
        disabled={placingOrder || !policyAccepted }
        onClick={() => {
          if (paymentMethod === "digital_payment") {
            handleDigitalPayment();
          } else {
            handlePlaceOrder();
          }
        }}
      >
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
      {placingOrder && (
  <div className="checkout-loader-overlay">
    <Loader />
    <p>Placing your order...</p>
  </div>
)}

    </div>
    
  );
}
