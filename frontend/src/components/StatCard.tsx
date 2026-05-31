interface Props { label: string; value: string | number; icon: string; color?: string; }
export default function StatCard({ label, value, icon, color = 'text-blue-600' }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
