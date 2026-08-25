import React, { useContext, useState } from "react";
import { LoginContext } from "../context/LoginContext";
import { NavLink, useNavigate } from "react-router-dom";
import API_URL from "../../api/api";

// ============================================================
// NAVIGATION STYLE
// ============================================================

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-white text-blue-900"
      : "text-white/90 hover:bg-white/10 hover:text-white"
  }`;

// ============================================================
// ROLE BASED NAVIGATION
// ============================================================

const NAV_ITEMS = [
  {
    to: "/admin",
    label: "Admin",
    roles: ["superadmin"],
  },

  {
    to: "/citizen",
    label: "Citizen",
    roles: ["citizen"],
  },

  {
    to: "/wardchairperson",
    label: "Ward Chairperson",
    roles: ["wardchairperson"],
  },

  {
    to: "/wardsecretary",
    label: "Ward Secretary",
    roles: ["wardsecretary"],
  },

  {
    to: "/validation",
    label: "Data Validation",
    roles: ["datavalidationofficer"],
  },

  {
    to: "/",
    label: "Home",
    roles: null,
  },
];

function Header() {
  const { isLogin, userRole, setisLogin, setRole } = useContext(LoginContext);

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      /*
       * IMPORTANT:
       *
       * If your backend has a logout endpoint, call it here.
       *
       * If your backend endpoint is different, change the URL.
       */

      try {
        const response = await fetch(`${API_URL}/v1/users/logout`, {
          method: "POST",
          credentials: "include",
        });

        /*
         * Don't prevent frontend logout if backend returns
         * 404 because the backend may not currently have
         * a logout endpoint.
         */
        if (!response.ok && response.status !== 404) {
          console.warn("Backend logout returned:", response.status);
        }
      } catch (error) {
        /*
         * Even if backend logout fails, clear frontend state.
         */
        console.warn("Backend logout request failed:", error);
      }
    } finally {
      // ========================================================
      // CLEAR FRONTEND AUTHENTICATION STATE
      // ========================================================

      setisLogin(false);
      setRole(null);

      setMobileOpen(false);

      // Go to login page
      navigate("/login", { replace: true });

      setLoggingOut(false);
    }
  };

  // ============================================================
  // ONLY SHOW ITEMS AVAILABLE FOR CURRENT ROLE
  // ============================================================

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!isLogin) {
      return false;
    }

    // roles === null means available to every logged-in user
    if (item.roles === null) {
      return true;
    }

    return item.roles.includes(userRole);
  });

  return (
    <header className="bg-blue-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ==================================================
              LOGO / HOME
          ================================================== */}

          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">
                वडा व्यवस्थापन प्रणाली
              </p>

              <p className="text-xs text-blue-100">Ward Management System</p>
            </div>
          </NavLink>

          {/* ==================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav className="hidden md:flex items-center gap-1">
            {visibleItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {/* =================================================
                LOGIN / LOGOUT
            ================================================= */}

            {isLogin ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="ml-2 px-4 py-2 rounded-md text-sm font-medium border border-white/40 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingOut ? "Signing Out..." : "Sign Out"}
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

          {/* ==================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
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

      {/* ======================================================
          MOBILE NAVIGATION
      ====================================================== */}

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

          {/* =================================================
              MOBILE LOGIN / LOGOUT
          ================================================= */}

          {isLogin ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-1 px-4 py-2 rounded-md text-sm font-medium border border-white/40 text-white text-left hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {loggingOut ? "Signing Out..." : "Sign Out"}
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
