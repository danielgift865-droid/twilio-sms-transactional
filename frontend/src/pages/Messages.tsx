import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { messagesApi } from '../api';
import Table from '../components/Table';
import { statusBadge, timeAgo } from '../utils/format';

export default function Messages() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refresh } = useApi<any>(() =>
    messagesApi.list(statusFilter ? { status: statusFilter } : {}), [statusFilter]);

  const retry = async (id: string) => {
    try { await messagesApi.retry(id); refresh(); alert('Retry queued!'); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="p-8 space-y-6">
      <div><h1>Messages</h1><p className="text-gray-500 text-sm mt-1">{data?.total ?? 0} messages total</p></div>

      <div className="flex gap-2 flex-wrap">
        {['','delivered','sent','queued','failed','undelivered'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter===s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <Table
        cols={[
          { key: 'direction', label: 'Dir', render: r => r.direction === 'outbound' ? '📤' : '📥' },
          { key: 'phone', label: 'Contact', render: r => r.contact?.phoneNumber || '—' },
          { key: 'body',  label: 'Message', render: r => (
            <span className="block max-w-xs truncate text-sm" title={r.body}>{r.body}</span>
          )},
          { key: 'status', label: 'Status', render: r => <span className={statusBadge(r.status)}>{r.status}</span> },
          { key: 'createdAt', label: 'Sent', render: r => timeAgo(r.createdAt) },
          { key: 'actions',   label: '', render: r => r.status === 'failed'
            ? <button className="text-xs text-blue-600 hover:underline" onClick={() => retry(r.id)}>Retry</button>
            : null },
        ]}
        rows={data?.messages ?? []}
        loading={loading}
        emptyMsg="No messages found."
      />
    </div>
  );
}
