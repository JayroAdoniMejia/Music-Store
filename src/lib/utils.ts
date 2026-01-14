export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(amount).replace('HNL', 'L'); // Reemplaza el código HNL por el símbolo L
};