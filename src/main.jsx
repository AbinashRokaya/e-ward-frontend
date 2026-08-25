import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  useLocation,
  useRouteError,
  Navigate,
} from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";

// Public pages
import AboutWard from "./pages/AboutWard.jsx";
import Contact from "./pages/Contact.jsx";
import Services from "./pages/Services.jsx";
import BirthRegistration from "./pages/BirthRegistration.jsx";
import Deathregistration from "./pages/Deathregistration.jsx";
import MigrationRegistration from "./pages/MigrationRegistration.jsx";
import RecommendationLetter from "./pages/RecommendationLetter.jsx";
import FileComplaint from "./pages/FileComplaint.jsx";
import NoticeBoard from "./pages/NoticeBoard.jsx";
import ComplaintBoard from "./pages/ComplaintBoard.jsx";
import AuthPage from "./pages/Authpage.jsx";

// Role dashboards
import AdminHome from "./components/admin/Adminhome.jsx";
import CertificateHome from "./components/citizen/Certificatehome.jsx";
import WardChairpersonHome from "./components/ward_chairperson/WardChairpersonHome.jsx";
import WardSecretaryHome from "./components/ward_secretary/WardSecretaryHome.jsx";
import DataValidationHome from "./components/datavalidation/DataValidationHome.jsx";
import NoticeManagement from "./components/notice/NoticeManagement.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";

// Context Providers
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LoginProvider, LoginContext } from "./components/context/LoginContext.jsx";

import "./index.css";

function ErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();

  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center px-4 text-center font-sans">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-3 border border-red-200 shadow-sm">
        ⚠️
      </div>
      <h1 className="text-xl font-bold text-slate-900">
        {error ? "Component Render Error" : "404 Page Not Found"}
      </h1>
      <div className="mt-3 bg-white p-4 rounded-xl border border-slate-200 text-left max-w-lg w-full text-xs shadow-sm">
        <p className="text-slate-600">
          <strong>Attempted Path:</strong>{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono">
            {location.pathname}
          </code>
        </p>
        {error && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="font-semibold text-slate-800 mb-1">Error Details:</p>
            <pre className="bg-red-50 text-red-700 p-2 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
              {error?.stack || error?.message || String(error)}
            </pre>
          </div>
        )}
      </div>
      <Link
        to="/login"
        className="mt-5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
      >
        Back to Login
      </Link>
    </div>
  );
}

// Role -> home route, used to send an already-logged-in visitor away from
// the login page instead of making them look at a form they don't need.
const ROLE_ROUTES = {
  superadmin: "/admin",
  citizen: "/citizen",
  wardchairperson: "/wardchairperson",
  wardsecretary: "/wardsecretary",
  datavalidationofficer: "/validation",
};

// Blocks unauthenticated users from protected routes. Reads LoginContext
// rather than localStorage directly, so a logout updates the guard in the
// same render instead of only after a refresh.
//
// NOTE: this is a UI convenience, not security — anyone can set
// localStorage.userRole in devtools and walk past it. The real protection is
// the backend, which checks the httpOnly access_token cookie on every
// endpoint and 401s regardless of what the frontend believes.
function ProtectedRoute({ children }) {
  const { isLogin } = useContext(LoginContext) || {};

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Sends an already-logged-in visitor straight to their dashboard rather than
// showing them the sign-in form again.
function AuthRoute() {
  const { isLogin, userRole } = useContext(LoginContext) || {};

  if (isLogin) {
    return <Navigate to={ROLE_ROUTES[userRole] || "/home"} replace />;
  }

  return <AuthPage />;
}

const router = createBrowserRouter([
  // Standalone auth routes — render only the auth card, no Header/layout.
  { path: "/", element: <AuthRoute />, errorElement: <ErrorBoundary /> },
  { path: "/login", element: <AuthRoute />, errorElement: <ErrorBoundary /> },
  { path: "/register", element: <AuthRoute />, errorElement: <ErrorBoundary /> },

  // Everything else sits behind login, inside the App layout (Header + Outlet).
  {
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: "home", element: <Home /> },

      // Informational pages
      { path: "about", element: <AboutWard /> },
      { path: "contact", element: <Contact /> },
      { path: "services", element: <Services /> },
      { path: "all-services", element: <Services /> },

      // Service registration forms
      { path: "birth-registration", element: <BirthRegistration /> },
      { path: "BirthRegistration", element: <BirthRegistration /> },
      { path: "death-registration", element: <Deathregistration /> },
      { path: "Deathregistration", element: <Deathregistration /> },
      { path: "DeathRegistration", element: <Deathregistration /> },
      { path: "migration-registration", element: <MigrationRegistration /> },
      { path: "MigrationRegistration", element: <MigrationRegistration /> },
      { path: "recommendation-letter", element: <RecommendationLetter /> },
      { path: "RecommendationLetter", element: <RecommendationLetter /> },
      { path: "file-complaint", element: <FileComplaint /> },
      { path: "FileComplaint", element: <FileComplaint /> },
      { path: "complaint", element: <ComplaintBoard /> },
      { path: "complaint-file", element: <FileComplaint /> },
      { path: "notice-board", element: <NoticeBoard /> },
      { path: "NoticeBoard", element: <NoticeBoard /> },
      { path: "notice-management", element: <NoticeManagement /> },

      // The old standalone /documents page is gone — its content now lives
      // inside the citizen portal (CertificateHome -> MyDocuments). This
      // redirect keeps any existing links and bookmarks working.
      { path: "documents", element: <Navigate to="/citizen" replace /> },

      // Role dashboards
      { path: "admin", element: <AdminHome /> },
      { path: "admin/dashboard", element: <AdminDashboard /> },
      { path: "admin/users", element: <AdminUsers /> },
      { path: "citizen", element: <CertificateHome /> },
      { path: "wardchairperson", element: <WardChairpersonHome /> },
      { path: "wardsecretary", element: <WardSecretaryHome /> },
      { path: "validation", element: <DataValidationHome /> },

      { path: "*", element: <ErrorBoundary /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoginProvider>
      <AuthProvider>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </AuthProvider>
    </LoginProvider>
  </React.StrictMode>,
);