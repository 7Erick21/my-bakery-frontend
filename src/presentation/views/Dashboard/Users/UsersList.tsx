'use client';

import type { FC } from 'react';

import { UserAvatar } from '@/components/atoms';
import type { UserProfile } from '@/lib/supabase/models';
import type { UserRole } from '@/lib/supabase/types';
import { formatDate } from '@/lib/utils/format';
import { updateUserRole } from '@/server/actions/users';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  marketing: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700'
};

const roleOptions = ['user', 'marketing', 'admin', 'super_admin'];

interface UsersListProps {
  users: UserProfile[];
}

export const UsersList: FC<UsersListProps> = ({ users }) => {
  const { t } = useTranslation();

  const columns = [
    {
      key: 'user',
      header: 'Usuario',
      render: (user: UserProfile) => (
        <div className='flex items-center gap-3'>
          <UserAvatar src={user.avatar_url} name={user.full_name} />
          <span className='font-medium text-gray-900 dark:text-gray-100'>
            {user.full_name || '—'}
          </span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: UserProfile) => <span className='text-gray-500'>{user.email}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: UserProfile) => (
        <select
          value={user.role}
          onChange={e => updateUserRole(user.id, e.target.value as UserRole)}
          className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${roleColors[user.role] || ''}`}
        >
          {roleOptions.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      )
    },
    {
      key: 'language',
      header: 'Idioma',
      render: (user: UserProfile) => (
        <span className='text-xs'>{user.preferred_language || 'es'}</span>
      )
    },
    {
      key: 'registered',
      header: 'Registro',
      render: (user: UserProfile) => (
        <span className='text-xs text-gray-500'>{formatDate(user.created_at)}</span>
      )
    }
  ];

  return (
    <div>
      <PageHeader title={t('dashboard.nav.users', 'Usuarios')} />
      <DataTable columns={columns} data={users} emptyMessage='No hay usuarios' />
    </div>
  );
};

UsersList.displayName = 'UsersList';
