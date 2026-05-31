import { useState, useEffect } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('sms_api_key') || '');
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    fetch('/health')
      .then(r => r.ok ? setHealth('ok') : setHealth('error'))
      .catch(() => setHealth('error'));
  }, []);

  const save = () => {
    localStorage.setItem('sms_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-lg space-y-6">
      <div><h1>Settings</h1><p className="text-gray-500 text-sm mt-1">Configure your SMS platform connection</p></div>

      {/* Server status */}
      <div className="card flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${health === 'ok' ? 'bg-green-500' : health === 'error' ? 'bg-red-500' : 'bg-yellow-400'}`} />
        <div>
          <p className="text-sm font-medium">Server Status</p>
          <p className="text-xs text-gray-400">{health === 'ok' ? 'Connected and healthy' : health === 'error' ? 'Cannot reach the backend' : 'Checking…'}</p>
        </div>
      </div>

      {/* API Key */}
      <div className="card space-y-3">
        <h2>API Key</h2>
        <p className="text-sm text-gray-500">Enter the API key from your <code className="bg-gray-100 px-1 rounded">.env</code> file. This is stored locally in your browser.</p>
        <input
          type="password"
          className="input font-mono"
          placeholder="your_secret_api_key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
        <button className="btn-primary" onClick={save}>{saved ? '✅ Saved!' : 'Save API Key'}</button>
      </div>

      {/* Twilio setup reminder */}
      <div className="card space-y-2 bg-blue-50 border-blue-200">
        <h2 className="text-blue-800">Twilio Setup Checklist</h2>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>☐ Add <code>TWILIO_ACCOUNT_SID</code> to your .env</li>
          <li>☐ Add <code>TWILIO_AUTH_TOKEN</code> to your .env</li>
          <li>☐ Add <code>TWILIO_PHONE_NUMBER</code> to your .env</li>
          <li>☐ Set inbound webhook URL in Twilio Console</li>
          <li>☐ Set status callback URL in Twilio Console</li>
          <li>☐ Run database migrations: <code>npx prisma migrate deploy</code></li>
        </ul>
      </div>
    </div>
  );
}
