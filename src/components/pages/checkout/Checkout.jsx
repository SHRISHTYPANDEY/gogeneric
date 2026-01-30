import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axiosInstance";
import Swal from "sweetalert2";
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
import { openRazorpay } from "../../../utils/razorpayPayment";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [instructions, setInstructions] = useState([]);
  const [selectedTip, setSelectedTip] = useState("0");
  const location = useLocation();
  const prescriptionStoreId = location.state?.store_id;
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const { balance: walletBalance, fetchWallet } = useWallet();
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


  const isPrescriptionOrder = location.state?.isPrescriptionOrder;

  const ORDER_API = isPrescriptionOrder
    ? "/api/v1/customer/order/prescription/place"
    : "/api/v1/customer/order/place";

  const [deliveryType, setDeliveryType] = useState(
    localStorage.getItem("delivery_type") || "delivery",
  );
  const cartAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  const getOrderStoreId = () => {
    if (prescriptionStoreId) return prescriptionStoreId;
    return cartItems?.[0]?.item?.store_id;
  };

  const deliveryCharge = deliveryType === "delivery" ? 50 : 0;
  const platformFee = 2;

  const totalPayable = cartAmount + deliveryCharge + platformFee;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const guestId = localStorage.getItem("guest_id");

  const isPrescriptionRequired = cartItems.some(
    (ci) => ci.item?.is_prescription_required == 1,
  );

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    // console.log("CART ITEMS FOR PRESCRIPTION", cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (location.state?.prescriptionFile) {
      setPrescriptionFile(location.state.prescriptionFile);
    }
  }, [location.state]);

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

      const items = res.data || [];
      setCartItems(items);

      if (items.length === 0 && !isPrescriptionOrder) {
        navigate("/cart");
      }
    } catch {
       showAlert("error", "Error", "Failed to load cart");
} finally {
      setLoading(false);
    }
  };

  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    localStorage.setItem("delivery_type", type);
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);

    if (method === "cash_on_delivery" || method === "wallet") {
      setPaymentReady(true);
    } else {
      setPaymentReady(false);
    }
  };

  const handleDigitalPayment = () => {
    if (!validateBeforeOrder()) return;

    openRazorpay({
      amount: totalPayable,
      name: "GoGeneric",
      description: "Order Payment",
      phone: selectedAddress?.phone,
      onSuccess: (response) => {
        placeOrderAfterPayment(response);
      },
    });
  };

  const placeOrderAfterPayment = async (paymentResponse) => {
    try {
      setPlacingOrder(true);
      const storeId = getOrderStoreId();

      const formData = new FormData();

      formData.append("order_type", deliveryType);
      formData.append("delivery_type", deliveryType);
      formData.append("payment_method", "digital_payment");
      formData.append("payment_status", "paid");
      formData.append("transaction_id", paymentResponse.razorpay_payment_id);
      formData.append("order_amount", totalPayable);
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

      if (isPrescriptionRequired && prescriptionFile) {
        formData.append("order_attachment[]", prescriptionFile);
      }

      const headers = {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await api.post(ORDER_API, formData, {
        headers,
      });

showAlert(
  "success",
  "Order Placed 🎉",
  "Thank you for shopping with us",
  1500
);
      window.dispatchEvent(new Event("cart-updated")); 
      navigate(`/orders/${res.data?.order_id}`);
    } catch (err) {
showAlert("error", "Failed", "Order placement failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateBeforeOrder()) return;

    // console.log("SELECTED ADDRESS FULL OBJECT", selectedAddress);

    if (!paymentMethod || !paymentReady) {
showAlert("warning", "Payment Pending", "Complete payment first");
      return;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
    showAlert("warning", "Address Required", "Please select delivery address");
      return;
    }

    if (!policyAccepted) {
     showAlert("warning", "Policy Required", "Please accept policies");
      return;
    }

    if ((isPrescriptionRequired || isPrescriptionOrder) && !prescriptionFile) {
showAlert("warning", "Prescription Required", "Prescription is required");
      return false;
    }

    if (paymentMethod === "digital_payment") {
      return;
    }

    try {
      setPlacingOrder(true);
      const storeId = getOrderStoreId();

      if (paymentMethod === "wallet") {
        if (walletBalance < totalPayable) {
          showAlert(
  "error",
  "Insufficient Balance",
  `Wallet balance ₹${walletBalance}`
);

          setPlacingOrder(false);
          return;
        }
      }
      const formData = new FormData();

      formData.append("order_type", deliveryType);
      formData.append("delivery_type", deliveryType);
      formData.append("payment_method", paymentMethod);
      formData.append("order_amount", totalPayable);
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
      if ((isPrescriptionRequired || isPrescriptionOrder) && prescriptionFile) {
        formData.append("order_attachment[]", prescriptionFile);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const headers = {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await api.post(ORDER_API, formData, { headers });
      if (isPrescriptionOrder) {
        console.log("PRESCRIPTION ORDER API RESPONSE ", res.data);
      }
      console.log("Cart order data", res.data);
      showAlert(
  "success",
  "Order Placed 🎉",
  "Thank you for shopping with us",
  1500
);

      window.dispatchEvent(new Event("cart-updated")); 
      fetchWallet();
      localStorage.removeItem("delivery_type");
      navigate(`/orders/${res.data?.order_id || ""}`);
    } catch (err) {
      console.error("ORDER ERROR", err.response?.data || err);
   showAlert("error", "Failed", "Order placement failed");

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

  const validateBeforeOrder = () => {
    if (!token) {
showAlert("info", "Login Required", "Please login first");
      navigate("/login");
      return false;
    }

    if (deliveryType === "delivery" && !selectedAddress) {
showAlert("warning", "Address Required", "Please select delivery address");
      return false;
    }

    if (!paymentMethod) {
showAlert("warning", "Payment Required", "Please select payment method");
      return false;
    }
    if (!getOrderStoreId()) {
   showAlert("error", "Error", "Store not found for this order");
      return false;
    }

    if (paymentMethod === "wallet" && walletBalance < totalPayable) {
showAlert(
  "error",
  "Insufficient Balance",
  `Wallet balance ₹${walletBalance}`
);
      return false;
    }

    if (isPrescriptionRequired && !prescriptionFile) {
 showAlert(
  "warning",
  "Prescription Required",
  "Prescription is required for selected medicines"
);
      return false;
    }

    if (!policyAccepted) {
   showAlert(
  "warning",
  "Policy Required",
  "Please accept Privacy Policy & Terms"
);
      return false;
    }

    return true;
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-layout">
        <div className="checkout-left">
          {!isPrescriptionOrder && <CartItems cartItems={cartItems} />}

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
          {(isPrescriptionOrder || isPrescriptionRequired) && (
            <PrescriptionUpload
              required={true}
              file={prescriptionFile}
              onChange={setPrescriptionFile}
            />
          )}

          <PaymentMethod
            value={paymentMethod}
            onChange={handlePaymentSelect}
            walletBalance={walletBalance}
            orderAmount={totalPayable}
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
          {!isPrescriptionOrder && (
            <BillSummary
              cartItems={cartItems}
              deliveryType={deliveryType}
              totalPayable={totalPayable}
            />
          )}
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
            <a href="/privacy" target="_blank">
              Privacy Policy
            </a>
            ,{" "}
            <a href="/terms" target="_blank">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/refund" target="_blank">
              Refund Policy
            </a>
          </span>
        </label>
      </div>

      <button
        className="place-order-btn"
        disabled={placingOrder}
        onClick={() => {
          if (!validateBeforeOrder()) return;

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
      {prescriptionFile && (
        <p style={{ color: "green", fontSize: "13px" }}>
          ✔ Prescription uploaded
        </p>
      )}
    </div>
  );
}
