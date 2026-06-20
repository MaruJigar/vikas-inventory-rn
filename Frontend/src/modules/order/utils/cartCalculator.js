/**
 * Exact replication of Backend Order Service discount calculation algorithms.
 * Gross -> Item Discount -> Net -> Sum -> Bill Discount -> Final
 */

export const calculateItemDiscount = (discountType, discountValue, grossLineAmount) => {
  if (!discountType || discountType === 'NONE' || !discountValue) return 0;
  if (discountType === 'PERCENTAGE') return (discountValue / 100) * grossLineAmount;
  return discountValue; // FLAT
};

export const calculateBillDiscount = (discountType, discountValue, grossOrderAmount) => {
  if (!discountType || discountType === 'NONE' || !discountValue) return 0;
  if (discountType === 'PERCENTAGE') return (discountValue / 100) * grossOrderAmount;
  return discountValue; // FLAT
};

export const calculateCartTotals = (items, billDiscountType = 'NONE', billDiscountValue = 0) => {
  let grossOrderAmount = 0;
  let totalProductDiscountAmount = 0;
  let totalQuantity = 0;

  const processedItems = items.map(item => {
    const grossLineAmount = Number(item.mrp) * Number(item.quantity);
    const itemDiscountAmount = calculateItemDiscount(item.itemDiscountType, item.itemDiscountValue, grossLineAmount);
    const netLineAmount = grossLineAmount - itemDiscountAmount;

    grossOrderAmount += netLineAmount;
    totalProductDiscountAmount += itemDiscountAmount;
    totalQuantity += Number(item.quantity);

    return {
      ...item,
      grossLineAmount,
      itemDiscountAmount,
      netLineAmount
    };
  });

  const billDiscountAmount = calculateBillDiscount(billDiscountType, billDiscountValue, grossOrderAmount);
  const finalOrderAmount = grossOrderAmount - billDiscountAmount;

  return {
    processedItems,
    grossOrderAmount,
    totalProductDiscountAmount,
    billDiscountType,
    billDiscountValue,
    billDiscountAmount,
    finalOrderAmount,
    totalQuantity
  };
};
