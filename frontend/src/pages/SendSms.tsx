import { useState } from 'react';
import { smsApi, contactsApi, templatesApi } from '../api';
import { useApi } from '../hooks/useApi';

type Mode = 'single' | 'template' | 'bulk';

export default function SendSms() {
  const [mode, setMode] = useState<Mode>('single');
  const [form, setForm] = useState({ phoneNumber: '', body: '', contactId: '', templateName: '', variables: '' });
  const [bulkList, setBulkList] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const contacts  = useApi<any>(() => contactsApi.list({ limit: '500' }));
  const templates = useApi<any>(() => templatesApi.list());

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    setLoading(true); setStatus(null);
    try {
      if (mode === 'single') {
        await smsApi.sendSingle({ to: form.phoneNumber, body: form.body, contactId: form.contactId });
        setStatus({ ok: true, msg: 'Message queued successfully!' });
      } else if (mode === 'template') {
        const variables = form.variables ? JSON.parse(form.variables) : {};
        await smsApi.sendTemplate({ contactId: form.contactId, templateName: form.templateName, variables });
        setStatus({ ok: true, msg: 'Template message queued!' });
      } else {
        const lines = bulkList.split('\n').filter(Boolean).map(l => {
          const [contactId, to, body] = l.split('|').map(s => s.trim());
          return { contactId, to, body };
        });
        await smsApi.sendBulk(lines);
        setStatus({ ok: true, msg: `${lines.length} messages queued!` });
      }
    } catch (e: any) { setStatus({ ok: false, msg: e.message }); }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1>Send SMS</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Send a transactional alert to one or many contacts</p>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {(['single','template','bulk'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode===m ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        {/* Contact picker */}
        {(mode === 'single' || mode === 'template') && (
          <div>
            <label className="label">Contact</label>
            <select className="input" value={form.contactId} onChange={e => set('contactId', e.target.value)}>
              <option value="">Select a contact…</option>
              {(contacts.data?.contacts ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.fullName || c.phoneNumber} — {c.phoneNumber}</option>
              ))}
            </select>
          </div>
        )}

        {mode === 'single' && (
          <>
            <div>
              <label className="label">Phone Number (E.164)</label>
              <input className="input" placeholder="+2348012345678" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input resize-none" rows={4} maxLength={1600} placeholder="Your order #1234 has been confirmed!"
                value={form.body} onChange={e => set('body', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">{form.body.length}/160 chars</p>
            </div>
          </>
        )}

        {mode === 'template' && (
          <>
            <div>
              <label className="label">Template</label>
              <select className="input" value={form.templateName} onChange={e => set('templateName', e.target.value)}>
                <option value="">Select a template…</option>
                {(templates.data ?? []).map((t: any) => (
                  <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Variables (JSON)</label>
              <textarea className="input font-mono resize-none" rows={3} placeholder={'{"name":"Daniel","orderId":"1234"}'}
                value={form.variables} onChange={e => set('variables', e.target.value)} />
            </div>
          </>
        )}

        {mode === 'bulk' && (
          <div>
            <label className="label">Bulk List (one per line: contactId | phoneNumber | message)</label>
            <textarea className="input font-mono resize-none" rows={8}
              placeholder={"uuid-1 | +2348012345678 | Your order is ready!\nuuid-2 | +2348087654321 | Payment confirmed."}
              value={bulkList} onChange={e => setBulkList(e.target.value)} />
          </div>
        )}

        {status && (
          <div className={`rounded-lg px-4 py-3 text-sm ${status.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.ok ? '✅' : '❌'} {status.msg}
          </div>
        )}

        <button className="btn-primary w-full justify-center" onClick={handleSend} disabled={loading}>
          {loading ? 'Sending…' : '📤 Send Message'}
        </button>
      </div>
    </div>
  );
}
