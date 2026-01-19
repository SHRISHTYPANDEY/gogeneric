import api from "../api/axiosInstance";
import toast from "react-hot-toast";

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
    toast.error("Product is out of stock");
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
        toast.error("No more stock available");
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

      toast.success("Quantity updated");
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

      toast.success("Added to cart");
    }

    // 🔹 STEP 5: FINAL SYNC (MOST IMPORTANT)
    await syncCartSnapshot({ token, guestId });

  } catch (err) {
    console.error("Add to cart error:", err?.response?.data);

    if (
      err?.response?.data?.message ===
      "Product out of stock warning"
    ) {
      toast.error("Product is out of stock");
      return;
    }

    toast.error(
      err?.response?.data?.errors?.[0]?.message ||
        "Failed to add item"
    );
  }
};
