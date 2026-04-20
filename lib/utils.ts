// Format price dengan separator ribuan
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price);
};

// Parse price dari string (hilangkan separator)
export const parsePrice = (priceStr: string): number => {
  const cleanStr = priceStr.replace(/\D/g, '');
  return parseInt(cleanStr) || 0;
};

// Format input harga dengan otomatis menambahkan separator
export const formatPriceInput = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanValue));
};
