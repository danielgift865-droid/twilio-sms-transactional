import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Messages from './pages/Messages';
import Templates from './pages/Templates';
import Conversations from './pages/Conversations';
import SendSms from './pages/SendSms';
import Settings from './pages/Settings';

const nav = [
  { to: '/',              label: '📊 Dashboard'      },
  { to: '/send',          label: '📤 Send SMS'       },
  { to: '/conversations', label: '💬 Conversations'  },
  { to: '/messages',      label: '📨 Messages'       },
  { to: '/contacts',      label: '👥 Contacts'       },
  { to: '/templates',     label: '🗂️ Templates'      },
  { to: '/settings',      label: '⚙️ Settings'       },
];

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-blue-600">📱 SMS Platform</h1>
          <p className="text-xs text-gray-400 mt-0.5">Transactional Alerts</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          Powered by Twilio
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/send"          element={<SendSms />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/messages"      element={<Messages />} />
          <Route path="/contacts"      element={<Contacts />} />
          <Route path="/templates"     element={<Templates />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="*"              element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
