function calculateVAT(amount, vatRate) {
  const vat = (amount * vatRate) / 100;
  const total = amount + vat;

  return {
    vatAmount: parseFloat(vat.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

module.exports = { calculateVAT };
