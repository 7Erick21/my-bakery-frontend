'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AddressItem } from '@/lib/supabase/models';
import type { DeliveryType, PaymentMethod } from '@/lib/supabase/types';
import { getErrorMessage } from '@/lib/utils/error';
import { formatPrice } from '@/lib/utils/format';
import { Layout } from '@/presentation/layout/Layout';
import { createAddress } from '@/server/actions/addresses';
import { createOrder } from '@/server/actions/orders';
import {
  DELIVERY_FEE,
  DELIVERY_TYPE_LABELS,
  OFFLINE_PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS
} from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useCartStore } from '@/shared/stores/cartStore';

// ── Stripe promise (singleton) ──
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

// ── Saved card type ──
interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

// ── Stripe form inner component ──
interface StripeFormProps {
  orderId: string;
  savedCards: SavedCard[];
  saveCard: boolean;
  onSuccess: () => void;
  onError: (msg: string) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  total: number;
  t: (key: string, fallback: string) => string;
}

const StripeForm: FC<StripeFormProps> = ({
  orderId,
  savedCards,
  saveCard,
  onSuccess,
  onError,
  submitting,
  setSubmitting,
  total,
  t
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | ''>('');
  const [useNewCard, setUseNewCard] = useState(savedCards.length === 0);

  const handleStripeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe) return;

      setSubmitting(true);
      onError('');

      try {
        if (!useNewCard && selectedSavedCard) {
          // Pay with saved card
          const { error } = await stripe.confirmPayment({
            clientSecret: (elements as unknown as { _commonOptions: { clientSecret: string } })
              ._commonOptions.clientSecret,
            confirmParams: {
              payment_method: selectedSavedCard,
              return_url: `${window.location.origin}/orders/${orderId}`
            },
            redirect: 'if_required'
          });
          if (error) {
            onError(error.message ?? 'Error al procesar el pago');
            setSubmitting(false);
            return;
          }
        } else {
          // Pay with new card via PaymentElement
          if (!elements) return;
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/orders/${orderId}`
            },
            redirect: 'if_required'
          });
          if (error) {
            onError(error.message ?? 'Error al procesar el pago');
            setSubmitting(false);
            return;
          }
        }
        onSuccess();
      } catch (err: unknown) {
        onError(getErrorMessage(err));
        setSubmitting(false);
      }
    },
    [stripe, elements, useNewCard, selectedSavedCard, orderId, onSuccess, onError, setSubmitting]
  );

  return (
    <form onSubmit={handleStripeSubmit} className='space-y-4'>
      {savedCards.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {t('checkout.savedCards', 'Tarjetas guardadas')}
          </p>
          {savedCards.map(card => (
            <button
              key={card.id}
              type='button'
              onClick={() => {
                setSelectedSavedCard(card.id);
                setUseNewCard(false);
              }}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm cursor-pointer transition-all flex items-center gap-3 ${
                !useNewCard && selectedSavedCard === card.id
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className='font-medium text-gray-900 dark:text-gray-100 capitalize'>
                {card.brand}
              </span>
              <span className='text-gray-500'>•••• {card.last4}</span>
              <span className='text-gray-400 text-xs ml-auto'>
                {String(card.expMonth).padStart(2, '0')}/{card.expYear}
              </span>
            </button>
          ))}
          <button
            type='button'
            onClick={() => setUseNewCard(true)}
            className={`w-full text-left p-3 rounded-xl border-2 text-sm cursor-pointer transition-all ${
              useNewCard
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {t('checkout.useNewCard', '+ Usar nueva tarjeta')}
          </button>
        </div>
      )}

      {useNewCard && (
        <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl'>
          <PaymentElement />
        </div>
      )}

      <button
        type='submit'
        disabled={submitting || !stripe}
        className='w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-semibold text-lg transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30'
      >
        {submitting
          ? t('checkout.processing', 'Procesando...')
          : `${t('checkout.pay', 'Pagar')} ${formatPrice(total)}`}
      </button>
    </form>
  );
};

StripeForm.displayName = 'StripeForm';

// ── Main Checkout component ──
interface CheckoutProps {
  addresses?: AddressItem[];
  bizumPhone?: string;
}

export const Checkout: FC<CheckoutProps> = ({ addresses = [], bizumPhone }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [useFutureDate, setUseFutureDate] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [buyerNif, setBuyerNif] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Stripe-specific state
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);

  // New address form fields
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrProvince, setAddrProvince] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Select default address on mount
  useEffect(() => {
    const defaultAddr = addresses.find(a => a.is_default);
    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
  }, [addresses]);

  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const subtotal = totalPrice();
  const computedTotal = subtotal + deliveryFee;
  const isOfflineMethod = (OFFLINE_PAYMENT_METHODS as readonly string[]).includes(paymentMethod);

  const lang = 'es';

  const stripeOptions = useMemo(
    () =>
      stripeClientSecret
        ? {
            clientSecret: stripeClientSecret,
            appearance: {
              theme: 'stripe' as const,
              variables: { colorPrimary: '#f59e0b' }
            }
          }
        : null,
    [stripeClientSecret]
  );

  // Create the order (shared logic for all methods)
  async function createOrderCommon(): Promise<{ orderId: string; isOffline: boolean }> {
    let addressId = deliveryType === 'delivery' ? selectedAddressId : null;

    // Create new address if needed
    if (deliveryType === 'delivery' && showNewAddress) {
      const addrForm = new FormData();
      addrForm.set('full_name', addrFullName);
      addrForm.set('phone', addrPhone);
      addrForm.set('street', addrStreet);
      addrForm.set('city', addrCity);
      addrForm.set('postal_code', addrPostalCode);
      addrForm.set('province', addrProvince);
      addrForm.set('is_default', 'false');

      const result = await createAddress(addrForm);
      addressId = result.addressId;
    }

    const formData = new FormData();
    formData.set(
      'items',
      JSON.stringify(
        items.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity }))
      )
    );
    if (useFutureDate && deliveryDate) formData.set('delivery_date', deliveryDate);
    if (notes) formData.set('notes', notes);
    if (couponCode) formData.set('coupon_code', couponCode);
    if (buyerNif.trim()) formData.set('buyer_nif', buyerNif.trim());
    formData.set('delivery_type', deliveryType);
    formData.set('payment_method', paymentMethod);
    formData.set('delivery_fee', String(deliveryFee));
    if (addressId) formData.set('address_id', addressId);

    return createOrder(formData);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const { orderId, isOffline } = await createOrderCommon();

      if (isOffline) {
        clearCart();
        router.push(`/orders/${orderId}`);
      } else {
        // Stripe: get client secret for PaymentElement
        const res = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, saveCard })
        });

        const data = await res.json();

        if (data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
          setSavedCards(data.paymentMethods || []);
          setStripeOrderId(orderId);
          setSubmitting(false);
        } else {
          setError('Error al crear la sesion de pago');
          setSubmitting(false);
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  function handleStripeSuccess() {
    clearCart();
    if (stripeOrderId) {
      router.push(`/orders/${stripeOrderId}`);
    }
  }

  const cardCls =
    'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm';
  const inputCls =
    'w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow';
  const sectionTitle =
    'text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3';

  const paymentIcons: Record<string, string> = {
    stripe: '💳',
    bizum: '📱',
    cash: '🏪'
  };

  // If we have a Stripe client secret, show the payment form
  if (stripeClientSecret && stripeOptions && stripeOrderId) {
    return (
      <Layout>
        <section className='min-h-dvh pt-24 pb-16'>
          <div className='max-w-2xl mx-auto px-4'>
            <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-2'>
              {t('checkout.completePayment', 'Completar pago')}
            </h1>
            <p className='text-gray-500 mb-8'>
              {t('checkout.enterCardDetails', 'Introduce los datos de tu tarjeta')}
            </p>

            <div className={`${cardCls} mb-5`}>
              <div className='flex justify-between items-center'>
                <span className='text-gray-500 text-sm'>Total</span>
                <span className='text-xl font-bold text-amber-600'>
                  {formatPrice(computedTotal)}
                </span>
              </div>
            </div>

            <div className={cardCls}>
              <Elements stripe={getStripe()} options={stripeOptions}>
                <StripeForm
                  orderId={stripeOrderId}
                  savedCards={savedCards}
                  saveCard={saveCard}
                  onSuccess={handleStripeSuccess}
                  onError={setError}
                  submitting={submitting}
                  setSubmitting={setSubmitting}
                  total={computedTotal}
                  t={t}
                />
              </Elements>
            </div>

            {error && (
              <div className='mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400'>
                {error}
              </div>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='max-w-2xl mx-auto px-4'>
          <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-2'>
            {t('cart.checkout', 'Realizar pedido')}
          </h1>
          <p className='text-gray-500 mb-8'>
            {t('checkout.reviewOrder', 'Revisa tu pedido y completa los datos')}
          </p>

          {items.length === 0 ? (
            <div className={`${cardCls} text-center py-16`}>
              <p className='text-gray-400 text-lg'>{t('cart.empty', 'Tu carrito esta vacio')}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className='space-y-5'>
              {/* Order summary with images */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>{t('checkout.summary', 'Resumen del pedido')}</h2>
                <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                  {items.map(item => (
                    <div key={item.productId} className='flex items-center gap-4 py-3'>
                      {item.imageUrl ? (
                        <div className='w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800'>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0'>
                          <span className='text-gray-400 text-2xl'>🍞</span>
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                          {item.name}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <span className='font-semibold text-gray-900 dark:text-gray-100 shrink-0'>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery type */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>{t('checkout.deliveryType', 'Tipo de entrega')}</h2>
                <div className='grid grid-cols-2 gap-3'>
                  {(['pickup', 'delivery'] as const).map(dt => (
                    <button
                      key={dt}
                      type='button'
                      onClick={() => setDeliveryType(dt)}
                      className={`p-4 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all ${
                        deliveryType === dt
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <span className='text-xl block mb-1'>{dt === 'pickup' ? '🏪' : '🚗'}</span>
                      {DELIVERY_TYPE_LABELS[dt]?.[lang] || dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address selector (delivery only) */}
              {deliveryType === 'delivery' && (
                <div className={cardCls}>
                  <h2 className={sectionTitle}>{t('checkout.address', 'Direccion de envio')}</h2>

                  {addresses.length > 0 && !showNewAddress && (
                    <div className='space-y-2 mb-3'>
                      {addresses.map(addr => (
                        <button
                          key={addr.id}
                          type='button'
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 text-sm cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          <p className='font-medium text-gray-900 dark:text-gray-100'>
                            {addr.full_name} {addr.is_default && '(default)'}
                          </p>
                          <p className='text-gray-500 text-xs mt-0.5'>
                            {addr.street}, {addr.city} {addr.postal_code}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type='button'
                    onClick={() => setShowNewAddress(!showNewAddress)}
                    className='text-amber-600 dark:text-amber-400 text-sm font-medium cursor-pointer hover:text-amber-700 dark:hover:text-amber-300 transition-colors'
                  >
                    {showNewAddress
                      ? t('checkout.useExisting', 'Usar direccion existente')
                      : t('checkout.newAddress', '+ Nueva direccion')}
                  </button>

                  {showNewAddress && (
                    <div className='grid grid-cols-2 gap-3 mt-4'>
                      <div className='col-span-2'>
                        <input
                          type='text'
                          placeholder={t('checkout.fullName', 'Nombre completo')}
                          value={addrFullName}
                          onChange={e => setAddrFullName(e.target.value)}
                          className={inputCls}
                          required
                        />
                      </div>
                      <input
                        type='tel'
                        placeholder={t('checkout.phone', 'Telefono')}
                        value={addrPhone}
                        onChange={e => setAddrPhone(e.target.value)}
                        className={inputCls}
                      />
                      <div className='col-span-2'>
                        <input
                          type='text'
                          placeholder={t('checkout.street', 'Calle y numero')}
                          value={addrStreet}
                          onChange={e => setAddrStreet(e.target.value)}
                          className={inputCls}
                          required
                        />
                      </div>
                      <input
                        type='text'
                        placeholder={t('checkout.city', 'Ciudad')}
                        value={addrCity}
                        onChange={e => setAddrCity(e.target.value)}
                        className={inputCls}
                        required
                      />
                      <input
                        type='text'
                        placeholder={t('checkout.postalCode', 'Codigo postal')}
                        value={addrPostalCode}
                        onChange={e => setAddrPostalCode(e.target.value)}
                        className={inputCls}
                        required
                      />
                      <input
                        type='text'
                        placeholder={t('checkout.province', 'Provincia')}
                        value={addrProvince}
                        onChange={e => setAddrProvince(e.target.value)}
                        className={inputCls}
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Schedule delivery date */}
              <div className={cardCls}>
                <div className='flex items-center gap-3 mb-3'>
                  <input
                    type='checkbox'
                    id='futureDate'
                    checked={useFutureDate}
                    onChange={e => setUseFutureDate(e.target.checked)}
                    className='w-4 h-4 accent-amber-500 cursor-pointer'
                  />
                  <label
                    htmlFor='futureDate'
                    className='text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none'
                  >
                    {t('checkout.scheduleDelivery', 'Programar fecha de entrega')}
                  </label>
                </div>
                {useFutureDate && (
                  <input
                    type='date'
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    min={minDate}
                    className={inputCls}
                    required={useFutureDate}
                  />
                )}
              </div>

              {/* Payment method */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>{t('checkout.paymentMethod', 'Metodo de pago')}</h2>
                <div className='grid grid-cols-3 gap-3'>
                  {(['stripe', 'bizum', 'cash'] as const).map(pm => (
                    <button
                      key={pm}
                      type='button'
                      onClick={() => setPaymentMethod(pm)}
                      className={`p-4 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all text-center ${
                        paymentMethod === pm
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <span className='text-xl block mb-1'>{paymentIcons[pm]}</span>
                      {PAYMENT_METHOD_LABELS[pm]?.[lang] || pm}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'stripe' && (
                  <div className='mt-4'>
                    <label className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={saveCard}
                        onChange={e => setSaveCard(e.target.checked)}
                        className='w-4 h-4 accent-amber-500 cursor-pointer'
                      />
                      {t('checkout.saveCard', 'Guardar tarjeta para futuras compras')}
                    </label>
                  </div>
                )}

                {paymentMethod === 'bizum' && (
                  <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-400'>
                    {t(
                      'checkout.bizumInfo',
                      'Al confirmar el pedido recibiras las instrucciones para realizar el pago por Bizum.'
                    )}
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-400'>
                    {t('checkout.cashInfo', 'Paga al recoger tu pedido en tienda.')}
                  </div>
                )}
              </div>

              {/* NIF/CIF for invoice */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>
                  {t('checkout.invoiceData', 'Datos de facturacion (opcional)')}
                </h2>
                <input
                  type='text'
                  value={buyerNif}
                  onChange={e => setBuyerNif(e.target.value)}
                  placeholder={t('checkout.nifPlaceholder', 'NIF/CIF (para factura completa)')}
                  className={inputCls}
                />
                <p className='text-xs text-gray-400 mt-2'>
                  {t(
                    'checkout.nifHelper',
                    'Si no indicas NIF, se generara una factura simplificada.'
                  )}
                </p>
              </div>

              {/* Coupon */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>{t('checkout.coupon', 'Cupon de descuento')}</h2>
                <input
                  type='text'
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder='CODIGO'
                  className={inputCls}
                />
              </div>

              {/* Notes */}
              <div className={cardCls}>
                <h2 className={sectionTitle}>{t('checkout.notes', 'Notas del pedido')}</h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder={t('checkout.notesPlaceholder', 'Instrucciones especiales...')}
                />
              </div>

              {/* Totals */}
              <div className={`${cardCls} !p-6`}>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>Subtotal</span>
                    <span className='text-gray-900 dark:text-gray-100 font-medium'>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-500'>
                        {t('checkout.deliveryFee', 'Gastos de envio')}
                      </span>
                      <span className='text-gray-900 dark:text-gray-100'>
                        {formatPrice(deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className='border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold'>
                    <span className='text-gray-900 dark:text-gray-100'>Total</span>
                    <span className='text-amber-600'>{formatPrice(computedTotal)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className='p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={submitting}
                className='w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl font-semibold text-lg transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30'
              >
                {submitting
                  ? t('checkout.processing', 'Procesando...')
                  : isOfflineMethod
                    ? t('checkout.confirmOrder', 'Confirmar pedido')
                    : `${t('checkout.pay', 'Pagar')} ${formatPrice(computedTotal)}`}
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

Checkout.displayName = 'Checkout';
