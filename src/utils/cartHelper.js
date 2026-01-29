import api from "../api/axiosInstance";
import Swal from "sweetalert2";

/**
 * Central alert helper (modal-style notification)
 */
const showAlert = (icon, title, text = "") => {
  Swal.fire({
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 1800,
    backdrop: "rgba(0,0,0,0.45)",
  });
};

/**
 * Sync cart item IDs from backend
 * Single source of truth = backend cart
 */
const syncCartSnapshot = async ({ token, guestId }) => {
  const res = await api.get("/api/v1/customer/cart/list", {
    headers: {
      zoneId: JSON.stringify([3]),
      moduleId: "2",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    params: !token ? { guest_id: guestId } : {},
  });

  const cartItems = res.data || [];
  const ids = cartItems.map((c) => c.item_id);

  localStorage.setItem("cart_item_ids", JSON.stringify(ids));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addToCart = async ({ item }) => {
  const token = localStorage.getItem("token");

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  // ✅ FAST FRONTEND STOCK CHECK
  if (
    item.available_stock === 0 ||
    item.stock === 0 ||
    item.quantity === 0 ||
    item.is_available === false
  ) {
    showAlert("error", "Out of Stock", "Product is currently unavailable");
    return;
  }

  try {
    // 🔹 STEP 1: GET CART
    const cartRes = await api.get("/api/v1/customer/cart/list", {
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      params: !token ? { guest_id: guestId } : {},
    });

    const cartItems = cartRes.data || [];

    // 🔹 STEP 2: CHECK IF ITEM EXISTS
    const existingItem = cartItems.find(
      (c) => c.item_id === item.id
    );

    // 🔹 STEP 3: UPDATE QTY IF EXISTS
    if (existingItem) {
      if (
        item.available_stock &&
        existingItem.quantity >= item.available_stock
      ) {
        showAlert("error", "Stock Limit Reached", "No more stock available");
        return;
      }

      await api.post(
        "/api/v1/customer/cart/update",
        {
          cart_id: existingItem.id,
          quantity: existingItem.quantity + 1,
          price: existingItem.price,
          ...(token ? {} : { guest_id: guestId }),
        },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      showAlert("success", "Cart Updated", "Quantity increased");
    }

    // 🔹 STEP 4: ADD NEW ITEM
    else {
      await api.post(
        "/api/v1/customer/cart/add",
        {
          item_id: item.id,
          quantity: 1,
          price: item.price,
          model: "Item",
          ...(token ? {} : { guest_id: guestId }),
        },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      showAlert("success", "Added to Cart", "Product added successfully");
    }

    // 🔹 STEP 5: FINAL SYNC
    await syncCartSnapshot({ token, guestId });

  } catch (err) {
    console.error("Add to cart error:", err?.response?.data);

    if (
      err?.response?.data?.message ===
      "Product out of stock warning"
    ) {
      showAlert("error", "Out of Stock", "Product is currently unavailable");
      return;
    }

    showAlert(
      "error",
      "Something went wrong",
      err?.response?.data?.errors?.[0]?.message || "Failed to add item"
    );
  }
};
