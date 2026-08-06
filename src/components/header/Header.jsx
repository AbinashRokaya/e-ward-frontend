import React, { useContext, useState } from "react";
import { LoginContext } from "../context/LoginContext";
import { NavLink, useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// Shares the same tokens as AuthPage.jsx — primary navy (blue-900),
// rounded-md, same font weights. Pull this into a single tokens.js file
// and import it in both places so the two never drift apart again.
// ---------------------------------------------------------------------------
const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-white text-blue-900"
      : "text-white/90 hover:bg-white/10 hover:text-white"
  }`;

// Single source of truth for role -> nav item. Fixes the bug in the
// original file where the "Notice" link was shown for every role and
// each role block was hand-duplicated (easy to typo one and miss the rest).
const NAV_ITEMS = [
  { to: "/admin", label: "Admin", roles: ["superadmin"] },
  { to: "/citizen", label: "Citizen", roles: ["citizen"] },
  {
    to: "/wardchairperson",
    label: "Ward Chairperson",
    roles: ["wardchairperson"],
  },
  { to: "/wardsecretary", label: "Ward Secretary", roles: ["wardsecretary"] },
  {
    to: "/validation",
    label: "Data Validation",
    roles: ["datavalidationofficer"],
  },
  { to: "/notice-management", label: "Notice", roles: null },
  { to: "/", label: "Home", roles: null }, // null = visible to any logged-in role
];

function Header() {
  const { isLogin, userRole, setisLogin, setRole } = useContext(LoginContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setisLogin(false);
    setRole?.(null);
    setMobileOpen(false);
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => isLogin && (item.roles === null || item.roles.includes(userRole)),
  );

  return (
    <header className="bg-blue-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo — left side, matches the header used on AuthPage */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            {/* <div className="w-9 h-9 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-xs font-semibold text-white">
              ने
            </div> */}
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-white">
                वडा व्यवस्थापन प्रणाली
              </p>
              <p className="text-xs text-blue-100">Ward Management System</p>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {isLogin ? (
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <NavLink
                to="/login"
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-900 hover:bg-blue-50 transition-colors"
              >
                Sign In
              </NavLink>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10"
          >
            {mobileOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {isLogin ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 px-4 py-2 rounded-md text-sm font-medium border border-white/40 text-white text-left hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-900 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
