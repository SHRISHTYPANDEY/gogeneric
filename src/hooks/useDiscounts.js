import { useState, useCallback } from "react";
import api from "../api/axiosInstance";

export default function useDiscounts() {
  const [discountMap, setDiscountMap] = useState({});

  const fetchDiscountedItems = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/items/discounted", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      const items = res.data.products || res.data.items || [];
      const map = {};

      items.forEach((item) => {
        if (item.id && item.discounted_price) {
          map[item.id] = item.discounted_price;
        }
      });

      setDiscountMap(map);
    } catch (err) {
      console.error("Discount API error", err);
    }
  }, []);

  return {
    discountMap,
    fetchDiscountedItems,
  };
}
