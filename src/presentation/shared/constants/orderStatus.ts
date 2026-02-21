import type { ComponentProps } from 'react';
import type { StatusBadge } from '@/components/atoms';

type StatusBadgeVariant = ComponentProps<typeof StatusBadge>['variant'];

export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'in_production',
  'ready',
  'delivered',
  'cancelled'
] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_production: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  delivered: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export const ORDER_STATUS_BADGE_VARIANTS: Record<string, StatusBadgeVariant> = {
  pending: 'yellow',
  confirmed: 'blue',
  in_production: 'purple',
  ready: 'green',
  delivered: 'gray',
  cancelled: 'red'
};

export const ORDER_STATUS_LABELS: Record<string, { es: string; en: string; ca: string }> = {
  pending: { es: 'Pendiente', en: 'Pending', ca: 'Pendent' },
  confirmed: { es: 'Confirmado', en: 'Confirmed', ca: 'Confirmat' },
  in_production: { es: 'En produccion', en: 'In production', ca: 'En produccio' },
  ready: { es: 'Listo', en: 'Ready', ca: 'Llest' },
  delivered: { es: 'Entregado', en: 'Delivered', ca: 'Lliurat' },
  cancelled: { es: 'Cancelado', en: 'Cancelled', ca: 'Cancel·lat' }
};

export const PAYMENT_STATUS_LABELS: Record<string, { es: string; en: string; ca: string }> = {
  pending: { es: 'Pendiente', en: 'Pending', ca: 'Pendent' },
  paid: { es: 'Pagado', en: 'Paid', ca: 'Pagat' },
  failed: { es: 'Fallido', en: 'Failed', ca: 'Fallit' },
  refunded: { es: 'Reembolsado', en: 'Refunded', ca: 'Reemborsat' }
};
