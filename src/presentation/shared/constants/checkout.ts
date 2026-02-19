export const DELIVERY_FEE = 1.0;
export const PAYMENT_METHODS = ['stripe', 'bizum', 'cash'] as const;
export const DELIVERY_TYPES = ['delivery', 'pickup'] as const;
export const OFFLINE_PAYMENT_METHODS = ['bizum', 'cash'] as const;

export const PAYMENT_METHOD_LABELS: Record<string, { es: string; en: string; ca: string }> = {
  stripe: { es: 'Tarjeta', en: 'Card', ca: 'Targeta' },
  bizum: { es: 'Bizum', en: 'Bizum', ca: 'Bizum' },
  cash: { es: 'Pago fisico', en: 'Pay in store', ca: 'Pagament fisic' }
};

export const DELIVERY_TYPE_LABELS: Record<string, { es: string; en: string; ca: string }> = {
  delivery: { es: 'Envío a domicilio', en: 'Home delivery', ca: 'Enviament a domicili' },
  pickup: { es: 'Recoger en tienda', en: 'Store pickup', ca: 'Recollir a botiga' }
};
