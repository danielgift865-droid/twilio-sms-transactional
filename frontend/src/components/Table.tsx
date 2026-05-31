interface Col<T> { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode; }
interface Props<T> { cols: Col<T>[]; rows: T[]; keyField?: keyof T; loading?: boolean; emptyMsg?: string; }

import React from 'react';

export default function Table<T extends Record<string, any>>({ cols, rows, keyField = 'id' as keyof T, loading, emptyMsg = 'No data' }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            {cols.map(c => <th key={String(c.key)} className="px-4 py-3 text-left font-medium">{c.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {loading ? (
            <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-gray-400">{emptyMsg}</td></tr>
          ) : rows.map(row => (
            <tr key={String(row[keyField])} className="hover:bg-gray-50 transition-colors">
              {cols.map(c => (
                <td key={String(c.key)} className="px-4 py-3">
                  {c.render ? c.render(row) : String(row[String(c.key)] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
