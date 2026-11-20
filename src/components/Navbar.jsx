
import { useEffect, useRef, useState } from "react";
import "../Styles/Navbar.css";

function Navbar({ onNavigate, user, notifications = [] }) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    function closeAccountMenuOnEscape(event) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeAccountMenu);
    document.addEventListener("keydown", closeAccountMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeAccountMenu);
      document.removeEventListener("keydown", closeAccountMenuOnEscape);
    };
  }, []);

  function navigate(page) {
    setAccountMenuOpen(false);
    onNavigate?.(page);
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Student Portal</h2>
      </div>

      <div className="navbar-links">
        <button type="button" onClick={() => navigate("dashboard")}>Dashboard</button>
        <button type="button" onClick={() => navigate("students")}>Students</button>
        <button type="button" onClick={() => navigate("register")}>Register</button>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-notification-button"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
          onClick={() => navigate("notifications")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7-2.5 9h17C20.5 16 18 16 18 9Z" />
            <path d="M10 21h4" />
          </svg>
          {unreadCount > 0 && (
            <span className="navbar-notification-count" aria-hidden="true">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div className="navbar-account" ref={accountMenuRef}>
          <button
            type="button"
            className="navbar-account-button"
            aria-expanded={accountMenuOpen}
            aria-controls={accountMenuOpen ? "navbar-account-menu" : undefined}
            onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
          >
            <span className="admin-avatar" aria-hidden="true">
              {(user?.email?.[0] || "A").toUpperCase()}
            </span>
            <span>{user?.email || "Administrator"}</span>
            <svg className="navbar-account-chevron" viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </button>
          {accountMenuOpen && (
            <div className="navbar-account-menu" id="navbar-account-menu">
              <p>{user?.email || "Administrator"}</p>
              <span>{user?.role === "admin" ? "Administrator" : "Student"}</span>
              <button type="button" onClick={() => navigate("profile")}>
                Open Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
