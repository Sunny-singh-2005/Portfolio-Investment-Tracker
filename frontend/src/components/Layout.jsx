import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `field-label px-3 py-2 border-b-2 transition-colors ${
          isActive
            ? "border-accent text-ink"
            : "border-transparent text-ink-soft hover:text-ink hover:border-line-strong"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line-strong bg-surface/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Ledger
            </span>
            <span className="ledger-num text-[11px] text-ink-faint">
              No. 01 &mdash; Portfolio Register
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/">Portfolios</NavItem>
            <NavItem to="/watchlist">Watchlist</NavItem>
          </nav>
          <div className="flex items-center gap-4">
            {user && (
              <span className="field-label text-ink-faint hidden sm:inline">
                {user.username}
              </span>
            )}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="field-label text-ink-soft hover:text-loss transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">{children}</main>
      <footer className="border-t border-line px-6 py-4 text-center">
        <span className="field-label text-ink-faint">
          Balances derived, not stored &mdash; weighted-average cost method
        </span>
      </footer>
    </div>
  );
}
