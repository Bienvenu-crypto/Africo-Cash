export function money(amount, currency) {
  const n = Number(amount) || 0;
  const formatted = n.toLocaleString("fr-FR", {
    minimumFractionDigits: currency === "CDF" ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return currency === "USD" ? `$${formatted}` : `${formatted} CDF`;
}
