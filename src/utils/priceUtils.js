export const getDiscountedPrice = (item, discountMap = {}) => {
  if (discountMap[item.id]) return discountMap[item.id];

  if (!item.discount || item.discount === 0) return null;

  const price = item.price || item.unit_price || 0;

  if (item.discount_type === "percent") {
    return Math.round(price - (price * item.discount) / 100);
  }

  if (item.discount_type === "amount") {
    return Math.max(price - item.discount, 0);
  }

  return null;
};

export const getFinalPrice = (item, discountMap = {}) => {
  const discounted = getDiscountedPrice(item, discountMap);
  return discounted ?? (item.price || item.unit_price);
};

export const getDiscountPercent = (item, discountMap = {}) => {
  const base = item.price || item.unit_price;
  const discounted = getDiscountedPrice(item, discountMap);

  if (!base || !discounted || discounted >= base) return null;

  return Math.round(((base - discounted) / base) * 100);
};
