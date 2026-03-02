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
  const [walletDiscount, setWalletDiscount] = useState(0);
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
  const [secondaryPayment, setSecondaryPayment] = useState(null);
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
  
const finalPayable = totalPayable - walletDiscount;
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
  if (method === "wallet") {
    if (walletBalance >= 25) {
      setWalletDiscount(25); // always deduct ₹25
      setPaymentReady(false); // need secondary method if total > 25
      if (finalPayable > 25) {
        showAlert(
          "info",
          "Wallet Applied",
          "₹25 deducted from wallet. Please select another payment method for remaining amount."
        );
      } else {
        setPaymentReady(true); // full payment covered by wallet
      }
    } else {
      setWalletDiscount(0);
      setPaymentReady(false);
      showAlert(
        "error",
        "Insufficient Wallet Balance",
        "Wallet can be used only if balance is ₹25 or more"
      );
    }
    setPaymentMethod("wallet"); // mark wallet as primary
  } else {
    // COD or Digital Payment
    if (walletDiscount > 0) {
      // wallet already applied
      setSecondaryPayment(method); // store as secondary payment
      setPaymentReady(true);
    } else {
      setWalletDiscount(0);
      setPaymentMethod(method);
      setSecondaryPayment(null);
      setPaymentReady(true);
    }
  }
};

  const handleDigitalPayment = () => {
  if (!validateBeforeOrder()) return;

  openRazorpay({
    amount: finalPayable, // use finalPayable here instead of totalPayable
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
        1500,
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
    return;
  }

  try {
    setPlacingOrder(true);
    const storeId = getOrderStoreId();
    const formData = new FormData();

    formData.append("order_type", deliveryType);
    formData.append("delivery_type", deliveryType);
    formData.append("payment_method", paymentMethod);
    formData.append("store_id", storeId);
    formData.append("wallet_amount", walletDiscount);

    formData.append("wallet_amount", walletDiscount);
if (walletDiscount > 0 && secondaryPayment) {
  formData.append("payment_method", secondaryPayment); // remaining amount payment method
} else {
  formData.append("payment_method", paymentMethod);
}
formData.append("order_amount", totalPayable);
    if (deliveryType === "delivery") {
      formData.append("address_id", selectedAddress.id);
      formData.append("address", selectedAddress.address);
      formData.append("latitude", selectedAddress.latitude);
      formData.append("longitude", selectedAddress.longitude);
      formData.append("distance", selectedAddress.distance || 1);
    }

    if (!token) formData.append("guest_id", guestId);
    if ((isPrescriptionRequired || isPrescriptionOrder) && prescriptionFile) {
      formData.append("order_attachment[]", prescriptionFile);
    }

    const headers = {
      zoneId: JSON.stringify([3]),
      moduleId: "2",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await api.post(ORDER_API, formData, { headers });

    showAlert("success", "Order Placed 🎉", "Thank you for shopping with us", 1500);
    window.dispatchEvent(new Event("cart-updated"));
    fetchWallet(); // Update remaining wallet balance
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
      showAlert(
        "warning",
        "Address Required",
        "Please select delivery address",
      );
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

    if (paymentMethod === "wallet" && walletBalance < 25) {
  showAlert(
    "error",
    "Insufficient Wallet Balance",
    "Wallet can be used only if balance is ₹25 or more"
  );
  return false;
}

    if (isPrescriptionRequired && !prescriptionFile) {
      showAlert(
        "warning",
        "Prescription Required",
        "Prescription is required for selected medicines",
      );
      return false;
    }

    if (!policyAccepted) {
      showAlert(
        "warning",
        "Policy Required",
        "Please accept Privacy Policy & Terms",
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
  orderAmount={finalPayable}
  disableWallet={walletBalance < 25} 
/>
{walletBalance < 25 && (
  <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
    Wallet can be used from ₹25 balance
  </p>
)}
          {paymentReady && (
            <p className="payment-success-text">✅ Payment confirmed</p>
          )}
        </div>

      <div className="checkout-right">
  {!isPrescriptionOrder && (
    <>
      <BillSummary
        cartItems={cartItems}
        deliveryType={deliveryType}
        walletDiscount={walletDiscount}
        totalPayable={finalPayable}
      />

      {/* Wallet Discount Info */}
      {walletDiscount > 0 && (
        <p style={{ color: "green", fontSize: "13px", marginTop: "5px" }}>
          ₹{walletDiscount} will be deducted from your wallet
        </p>
      )}

      {/* Remaining Payment Info if hybrid */}
      {walletDiscount > 0 && secondaryPayment && (
        <p style={{ color: "blue", fontSize: "13px", marginTop: "3px" }}>
          Remaining ₹{finalPayable} will be paid via{" "}
          {secondaryPayment === "cash_on_delivery"
            ? "Cash on Delivery"
            : "Pay Online"}
        </p>
      )}
    </>
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
