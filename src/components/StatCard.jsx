
import "../styles/StatCard.css";

function StatCard({ title, value, icon }) {
  const icons = {
    users: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.5 19.2v-1.1c0-2-1.7-3.7-3.7-3.7H7.2c-2 0-3.7 1.7-3.7 3.7v1.1" />
        <circle cx="10" cy="7.8" r="3.3" />
        <path d="M16 11.2a3.2 3.2 0 1 0 0-6.2M16.5 14.4c2.3.2 4.2 1.7 4.2 3.7v1.1" />
      </svg>
    ),
    active: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m7.8 12.2 2.7 2.7 5.9-6" />
      </svg>
    ),
    inactive: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.2 8.8v6.4M14.8 8.8v6.4" />
      </svg>
    ),
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon-${icon}`}>{icons[icon]}</div>
      <div>
        <h3>{title}</h3>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default StatCard;
