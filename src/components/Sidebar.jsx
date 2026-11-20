import { useState } from "react";
import "../styles/Sidebar.css";

const navigationIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19v-1.2c0-2.5 2.2-4.3 5.5-4.3s5.5 1.8 5.5 4.3V19Z" />
      <path d="M15 5.3a3 3 0 0 1 0 5.8M17 13.8c2.2.6 3.5 2 3.5 4V19h-3" />
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="4" y="5" width="12" height="15" rx="2" />
      <path d="M8 5V3.5h4V5m-2 5v6m-3-3h6m4-1h4m-2-2v4" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20v-1.5c0-3.1 2.9-5.2 7-5.2s7 2.1 7 5.2V20Z" />
    </svg>
  ),
  "id-card": (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5.8 16c.4-1.3 1.5-2 3.2-2s2.8.7 3.2 2m2-5h4m-4 3h4" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 20V4m0 16h17" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" />
      <rect x="12" y="8" width="3" height="9" rx="0.5" />
      <rect x="17" y="5" width="3" height="12" rx="0.5" />
    </svg>
  ),
  attendance: (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3.5v3m8-3v3m-12.5 3h17M8 14l2.5 2.5L16 11" />
    </svg>
  ),
  fees: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M3.5 7.5h15a2 2 0 0 1 2 2V19h-15a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" />
      <path d="M16 12h4.5v4H16a2 2 0 0 1 0-4Z" />
      <circle cx="16.5" cy="14" r=".5" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v5h5m-9 4h5m-5 4h5" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7-2.5 9h17C20.5 16 18 16 18 9Zm-8 12h4" />
    </svg>
  ),
  backup: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" />
    </svg>
  ),
};

function Sidebar({ activePage = "dashboard", onNavigate, role = "admin" }) {
  const [collapsed, setCollapsed] = useState(false);

  function navigate(page) {
    onNavigate?.(page);
  }

  const adminLinks = [
    ["dashboard", "Dashboard"],
    ["students", "All Students"],
    ["register", "Registration"],
    ["profile", "Profile"],
    ["id-card", "Student ID Card"],
    ["reports", "Reports & Analytics"],
    ["attendance", "Attendance"],
    ["fees", "Fees"],
    ["documents", "Documents"],
    ["notifications", "Notifications"],
    ["backup", "Backup & Restore"],
  ];
  const studentLinks = [
    ["dashboard", "Dashboard"],
    ["profile", "My Profile"],
    ["id-card", "Student ID Card"],
    ["attendance", "Attendance"],
    ["fees", "Fees"],
    ["documents", "Documents"],
    ["notifications", "Notifications"],
  ];
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <p className="sidebar-label">Main Menu</p>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
        </button>
      </div>
      <nav aria-label="Main navigation">
        <ul>
          {links.map(([page, label]) => (
            <li key={page}>
              <button
                type="button"
                className={`sidebar-link ${activePage === page ? "active" : ""}`}
                title={collapsed ? label : undefined}
                onClick={() => navigate(page)}
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  {navigationIcons[page]}
                </span>
                <span className="sidebar-link-label">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
