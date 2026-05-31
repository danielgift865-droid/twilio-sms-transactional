import { useApi } from '../hooks/useApi';
import { messagesApi, contactsApi, conversationsApi } from '../api';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const messages = useApi<any>(() => messagesApi.list({ limit: '500' }));
  const contacts = useApi<any>(() => contactsApi.list({ limit: '1' }));
  const convos   = useApi<any>(() => conversationsApi.list({ limit: '1' }));

  const msgs = messages.data?.messages ?? [];
  const statusCounts = msgs.reduce((acc: Record<string, number>, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Delivered', value: statusCounts.delivered || 0, fill: '#22c55e' },
    { name: 'Sent',      value: statusCounts.sent      || 0, fill: '#3b82f6' },
    { name: 'Queued',    value: statusCounts.queued    || 0, fill: '#f59e0b' },
    { name: 'Failed',    value: statusCounts.failed    || 0, fill: '#ef4444' },
  ];

  const deliveryRate = msgs.length
    ? Math.round(((statusCounts.delivered || 0) / msgs.length) * 100) : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your SMS platform at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value={messages.data?.total ?? '…'} icon="📨" color="text-blue-600" />
        <StatCard label="Delivery Rate"  value={`${deliveryRate}%`}          icon="✅" color="text-green-600" />
        <StatCard label="Total Contacts" value={contacts.data?.total ?? '…'} icon="👥" color="text-purple-600" />
        <StatCard label="Open Conversations" value={convos.data?.total ?? '…'} icon="💬" color="text-orange-500" />
      </div>

      <div className="card">
        <h2 className="mb-4">Message Status Breakdown</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6,6,0,0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="mb-4">Recent Messages</h2>
        <div className="space-y-2">
          {(msgs.slice(0, 8) as any[]).map((m: any) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-medium text-sm">{m.contact?.phoneNumber || '—'}</span>
                <p className="text-xs text-gray-500 truncate max-w-xs">{m.body}</p>
              </div>
              <span className={`badge ${m.status === 'delivered' ? 'badge-green' : m.status === 'failed' ? 'badge-red' : m.status === 'sent' ? 'badge-blue' : 'badge-yellow'}`}>
                {m.status}
              </span>
            </div>
          ))}
          {msgs.length === 0 && !messages.loading && (
            <p className="text-gray-400 text-sm text-center py-6">No messages yet. Send your first SMS!</p>
          )}
        </div>
      </div>
    </div>
  );
}
