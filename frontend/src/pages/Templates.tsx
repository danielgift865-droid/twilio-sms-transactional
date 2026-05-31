import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { templatesApi } from '../api';

const CATEGORIES = ['otp','order','payment','shipping','reminder','custom'];

export default function Templates() {
  const { data, loading, refresh } = useApi<any[]>(() => templatesApi.list());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name:'', category:'custom', body:'' });
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm({ name:'', category:'custom', body:'' }); setShowForm(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, category: t.category, body: t.body }); setShowForm(true); };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await templatesApi.update(editing.id, form);
      else await templatesApi.create(form);
      setShowForm(false); refresh();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete template?')) return;
    await templatesApi.delete(id); refresh();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1>Templates</h1><p className="text-gray-500 text-sm mt-1">Reusable message templates with variable substitution</p></div>
        <button className="btn-primary" onClick={openNew}>+ New Template</button>
      </div>

      {showForm && (
        <div className="card space-y-4 max-w-lg">
          <h2>{editing ? 'Edit Template' : 'New Template'}</h2>
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="order_confirmation" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Body (use {'{{variable}}'} for dynamic values)</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Hi {{name}}, your order {{orderId}} is confirmed. Total: {{amount}}."
              value={form.body} onChange={e => set('body', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">{form.body.length}/160 chars · Multi-part if &gt;160</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid gap-4">
          {(data ?? []).map((t: any) => (
            <div key={t.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{t.name}</span>
                  <span className="badge badge-blue">{t.category}</span>
                  {!t.isActive && <span className="badge badge-gray">Inactive</span>}
                </div>
                <p className="text-sm text-gray-600 font-mono bg-gray-50 rounded px-2 py-1">{t.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-xs text-blue-600 hover:underline" onClick={() => openEdit(t)}>Edit</button>
                <button className="text-xs text-red-500 hover:underline" onClick={() => remove(t.id)}>Delete</button>
              </div>
            </div>
          ))}
          {(data ?? []).length === 0 && <p className="text-gray-400 text-sm text-center py-10 card">No templates yet. Create your first one!</p>}
        </div>
      )}
    </div>
  );
}
