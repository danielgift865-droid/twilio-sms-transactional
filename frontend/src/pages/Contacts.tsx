import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { contactsApi } from '../api';
import Table from '../components/Table';

export default function Contacts() {
  const { data, loading, refresh } = useApi<any>(() => contactsApi.list());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ phoneNumber: '', fullName: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const rows = (data?.contacts ?? []).filter((c: any) =>
    !search || c.phoneNumber.includes(search) || (c.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    setSaving(true);
    try { await contactsApi.create(form); setShowForm(false); setForm({ phoneNumber: '', fullName: '' }); refresh(); }
    catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const optOut = async (id: string) => {
    if (!confirm('Opt this contact out?')) return;
    await contactsApi.optOut(id); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete contact?')) return;
    await contactsApi.delete(id); refresh();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1>Contacts</h1><p className="text-gray-500 text-sm mt-1">{data?.total ?? 0} total contacts</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Contact</button>
      </div>

      <input className="input max-w-xs" placeholder="Search contacts…" value={search} onChange={e => setSearch(e.target.value)} />

      {showForm && (
        <div className="card space-y-3 max-w-md">
          <h2>New Contact</h2>
          <input className="input" placeholder="Phone (+2348012345678)" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
          <input className="input" placeholder="Full name (optional)" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Table
        cols={[
          { key: 'phoneNumber', label: 'Phone' },
          { key: 'fullName',    label: 'Name', render: r => r.fullName || '—' },
          { key: 'optedOut',    label: 'Status', render: r => r.optedOut
            ? <span className="badge-red badge">Opted Out</span>
            : <span className="badge-green badge">Active</span> },
          { key: 'createdAt',   label: 'Added', render: r => new Date(r.createdAt).toLocaleDateString() },
          { key: 'actions',     label: '', render: r => (
            <div className="flex gap-2">
              {!r.optedOut && <button className="text-xs text-yellow-600 hover:underline" onClick={() => optOut(r.id)}>Opt out</button>}
              <button className="text-xs text-red-500 hover:underline" onClick={() => remove(r.id)}>Delete</button>
            </div>
          )},
        ]}
        rows={rows}
        loading={loading}
        emptyMsg="No contacts yet. Add your first one!"
      />
    </div>
  );
}
