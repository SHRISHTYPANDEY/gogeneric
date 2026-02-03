export const getDiscountedPrice = (item, discountMap = {}) => {
  if (!item) return null;

  if (discountMap[item.id]) {
    return Number(discountMap[item.id]);
  }

  if (!item.discount || item.discount === 0) return null;

  const basePrice =
    item.mrp || item.price || item.unit_price;

  if (!basePrice) return null;

  let discountedPrice = basePrice;

  if (item.discount_type === "percent") {
    discountedPrice -= (basePrice * item.discount) / 100;
  } else if (item.discount_type === "amount") {
    discountedPrice -= item.discount;
  }

  return Math.max(Number(discountedPrice.toFixed(2)), 0);
};


export const getFinalPrice = (item, discountMap = {}) => {
  const discounted = getDiscountedPrice(item, discountMap);

  if (discounted !== null) return discounted;

  return item.price || item.unit_price || item.mrp || 0;
};

export const getDiscountPercent = (item, discountMap = {}) => {
  const base = item.mrp || item.price || item.unit_price || 0;
  const discounted = getDiscountedPrice(item, discountMap);

  if (!base || !discounted || discounted >= base) return null;

  return Math.round(((base - discounted) / base) * 100);
};