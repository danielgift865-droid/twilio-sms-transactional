import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { conversationsApi } from '../api';
import { timeAgo } from '../utils/format';

export default function Conversations() {
  const [selected, setSelected] = useState<any>(null);
  const { data, loading, refresh } = useApi<any>(() => conversationsApi.list());
  const thread = useApi<any>(
    () => selected ? conversationsApi.get(selected.id) : Promise.resolve(null),
    [selected?.id]
  );

  const close = async (id: string) => {
    await conversationsApi.close(id); refresh(); setSelected(null);
  };

  return (
    <div className="p-8 space-y-4">
      <h1>Conversations</h1>
      <p className="text-gray-500 text-sm">Two-way SMS threads with your contacts</p>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-72 shrink-0 overflow-y-auto space-y-2">
          {loading && <p className="text-gray-400 text-sm">Loading…</p>}
          {(data?.conversations ?? []).map((c: any) => (
            <div key={c.id}
              onClick={() => setSelected(c)}
              className={`card cursor-pointer hover:border-blue-300 transition-colors p-4 ${selected?.id === c.id ? 'border-blue-400 bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{c.contact?.fullName || c.contact?.phoneNumber}</span>
                <span className={`badge ${c.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
              </div>
              <p className="text-xs text-gray-400">{c.lastMessageAt ? timeAgo(c.lastMessageAt) : '—'}</p>
            </div>
          ))}
          {!loading && (data?.conversations ?? []).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">No conversations yet.</p>
          )}
        </div>

        {/* Thread */}
        <div className="flex-1 card overflow-y-auto">
          {!selected && <p className="text-gray-400 text-sm text-center py-20">Select a conversation to view the thread</p>}
          {selected && (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold">{selected.contact?.fullName || selected.contact?.phoneNumber}</p>
                  <p className="text-xs text-gray-400">{selected.contact?.phoneNumber}</p>
                </div>
                {selected.status === 'open' && (
                  <button className="btn-secondary text-xs" onClick={() => close(selected.id)}>Close conversation</button>
                )}
              </div>
              <div className="space-y-3">
                {(thread.data?.messages ?? []).map((m: any) => (
                  <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.direction === 'outbound' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p>{m.body}</p>
                      <p className={`text-xs mt-1 ${m.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
