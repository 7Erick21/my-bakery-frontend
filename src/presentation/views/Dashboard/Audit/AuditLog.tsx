'use client';

import { type FC, useState } from 'react';

import { Select, StatusBadge } from '@/components/atoms';
import type { AuditEntry } from '@/lib/supabase/models';
import { formatDateTime } from '@/lib/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

const actionVariant: Record<string, 'green' | 'blue' | 'red'> = {
  create: 'green',
  update: 'blue',
  delete: 'red'
};

interface AuditLogProps {
  entries: AuditEntry[];
}

export const AuditLog: FC<AuditLogProps> = ({ entries }) => {
  const { t } = useTranslation();
  const [filterTable, setFilterTable] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const tables = [...new Set(entries.map(e => e.table_name))];

  const filtered = entries.filter(entry => {
    if (filterTable && entry.table_name !== filterTable) return false;
    if (filterAction && entry.action !== filterAction) return false;
    return true;
  });

  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      render: (entry: AuditEntry) => (
        <span className='text-xs text-gray-500'>{formatDateTime(entry.created_at)}</span>
      )
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (entry: AuditEntry) => entry.profiles?.full_name || entry.profiles?.email || '—'
    },
    {
      key: 'table',
      header: 'Tabla',
      render: (entry: AuditEntry) => <span className='font-mono text-xs'>{entry.table_name}</span>
    },
    {
      key: 'action',
      header: 'Acción',
      render: (entry: AuditEntry) => (
        <StatusBadge variant={actionVariant[entry.action] || 'gray'}>{entry.action}</StatusBadge>
      )
    },
    {
      key: 'record',
      header: 'Registro',
      render: (entry: AuditEntry) => (
        <span className='font-mono text-xs'>{entry.record_id?.slice(0, 8)}</span>
      )
    }
  ];

  return (
    <div>
      <PageHeader title={t('dashboard.nav.audit', 'Auditoría')} />

      <div className='flex gap-4 mb-6'>
        <Select value={filterTable} onChange={e => setFilterTable(e.target.value)}>
          <option value=''>Todas las tablas</option>
          {tables.map(table => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </Select>
        <Select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value=''>Todas las acciones</option>
          <option value='create'>Create</option>
          <option value='update'>Update</option>
          <option value='delete'>Delete</option>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage='No hay registros' />
    </div>
  );
};

AuditLog.displayName = 'AuditLog';
