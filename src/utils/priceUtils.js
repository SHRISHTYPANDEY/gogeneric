export const getDiscountedPrice = (item, discountMap = {}) => {
  if (discountMap[item.id]) return discountMap[item.id];

  if (!item.discount || item.discount === 0) return null;

  const basePrice = item.mrp || item.price || item.unit_price || 0;

  let discountedPrice;
  if (item.discount_type === "percent") {
    discountedPrice = basePrice - (basePrice * item.discount) / 100;
  } else if (item.discount_type === "amount") {
    discountedPrice = basePrice - item.discount;
  } else {
    return null;
  }

  return Math.max(Math.round(discountedPrice), 0);
};

export const getFinalPrice = (item, discountMap = {}) => {
  return item.price || item.unit_price || 0;
};

export const getDiscountPercent = (item, discountMap = {}) => {
  const base = item.mrp || item.price || item.unit_price || 0;
  const discounted = getDiscountedPrice(item, discountMap);

  if (!base || !discounted || discounted >= base) return null;

  return Math.round(((base - discounted) / base) * 100);
};