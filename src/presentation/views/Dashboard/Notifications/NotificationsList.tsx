'use client';

import type { FC } from 'react';
import { Button } from '@/components/atoms';
import type { NotificationItem } from '@/lib/supabase/models';
import { formatDateTime } from '@/lib/utils/format';
import { markAllNotificationsRead, markNotificationRead } from '@/server/actions/notifications';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { PageHeader } from '../shared/PageHeader';

const typeIcons: Record<string, string> = {
  new_order: '🛒',
  low_stock: '📦',
  new_review: '⭐',
  order_status_change: '🔄'
};

interface NotificationsListProps {
  notifications: NotificationItem[];
}

export const NotificationsList: FC<NotificationsListProps> = ({ notifications }) => {
  const { t } = useTranslation();
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title={t('dashboard.nav.notifications', 'Notificaciones')}
        subtitle={unread > 0 ? `${unread} sin leer` : undefined}
        action={
          unread > 0 ? (
            <Button
              variant='primary'
              className='cursor-pointer'
              onClick={() => markAllNotificationsRead()}
            >
              Marcar todas como leídas
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <p className='text-gray-500 py-12 text-center'>No hay notificaciones</p>
      ) : (
        <div className='space-y-2'>
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-colors ${
                notification.is_read
                  ? 'bg-[image:var(--background-image-dashboard-card-light)] dark:bg-[image:var(--background-image-dashboard-card-dark)] border-border-card-children-light dark:border-border-card-children-dark'
                  : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  <span className='text-xl mt-0.5'>{typeIcons[notification.type] || '📌'}</span>
                  <div>
                    <p className='text-gray-900 dark:text-gray-100 text-16-20 font-medium'>
                      {notification.title}
                    </p>
                    <p className='text-gray-500 text-16-20 mt-0.5'>{notification.message}</p>
                    <p className='text-gray-400 text-sm mt-1'>
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button
                    variant='ghost'
                    onClick={() => markNotificationRead(notification.id)}
                    className='!text-sm !text-amber-600 hover:!text-amber-700 !border-0 !p-0 shrink-0'
                  >
                    Marcar leída
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

NotificationsList.displayName = 'NotificationsList';
