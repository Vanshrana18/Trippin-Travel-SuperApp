// eslint-disable-next-line no-unused-vars
export default function StatCard({ icon: Icon, label, value, color = 'terra' }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}
