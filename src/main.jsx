import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

// Context
import { LoginProvider } from "./components/context/LoginContext.jsx";

// Main app
import App from "./App.jsx";

// Pages
import Home from "./pages/Home.jsx";
import AuthPage from "./pages/Authpage.jsx";
import Register from "./pages/Register.jsx";
import Preview from "./components/Preview.jsx";

import NoticeBoard from "./pages/NoticeBoard.jsx";
import NoticeManagement from "./components/notice/NoticeManagement.jsx";

import BirthRegistration from "./pages/BirthRegistration.jsx";
import DeathRegistration from "./pages/Deathregistration.jsx";
import MigrationRegistration from "./pages/MigrationRegistration.jsx";

import ComplaintBoard from "./pages/ComplaintBoard.jsx";
import FileComplaint from "./pages/FileComplaint.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";

// Citizen
import CertificateHome from "./components/citizen/Certificatehome.jsx";

// Admin
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import AdminHome from "./components/admin/Adminhome.jsx";

// Other roles
import DataValidationHome from "./components/datavalidation/DataValidationHome.jsx";
import WardChairpersonHome from "./components/ward_chairperson/WardChairpersonHome.jsx";
import WardSecretaryHome from "./components/ward_secretary/WardSecretaryHome.jsx";

// Certificate
import Birth_certificate from "./components/Birth_certificate.jsx";

// ============================================================
// ROUTER
// ============================================================

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      // ========================================================
      // PUBLIC
      // ========================================================

      {
        path: "/",
        element: <Home />,
      },

      {
        path: "/login",
        element: <AuthPage />,
      },

      {
        path: "/register",
        element: <Register />,
      },

      {
        path: "/preview",
        element: <Preview />,
      },

      {
        path: "/notice-board",
        element: <NoticeBoard />,
      },

      // ========================================================
      // ADMIN
      // ========================================================

      {
        path: "/admin",
        element: <AdminHome />,
      },

      {
        path: "/admin/dashboard",
        element: <Dashboard />,
      },

      {
        path: "/admin/users",
        element: <Users />,
      },

      // ========================================================
      // CITIZEN
      // ========================================================

      {
        path: "/citizen",
        element: <CertificateHome />,
      },

      // ========================================================
      // DATA VALIDATION
      // ========================================================

      {
        path: "/validation",
        element: <DataValidationHome />,
      },

      // ========================================================
      // WARD CHAIRPERSON
      // ========================================================

      {
        path: "/wardchairperson",
        element: <WardChairpersonHome />,
      },

      // ========================================================
      // WARD SECRETARY
      // ========================================================

      {
        path: "/wardsecretary",
        element: <WardSecretaryHome />,
      },

      // ========================================================
      // NOTICE MANAGEMENT
      // ========================================================

      {
        path: "/notice-management",
        element: <NoticeManagement />,
      },

      // ========================================================
      // CERTIFICATES
      // ========================================================

      {
        path: "/certi",
        element: <Birth_certificate />,
      },

      // ========================================================
      // REGISTRATION
      // ========================================================

      {
        path: "/birth",
        element: <BirthRegistration />,
      },

      {
        path: "/death",
        element: <DeathRegistration />,
      },

      {
        path: "/migration",
        element: <MigrationRegistration />,
      },

      // ========================================================
      // COMPLAINT
      // ========================================================

      {
        path: "/complaint",
        element: <ComplaintBoard />,
      },

      {
        path: "/complaint-file",
        element: <FileComplaint />,
      },

      // ========================================================
      // VERIFY
      // ========================================================

      {
        path: "/verify/:id",
        element: <VerifyCertificate />,
      },
    ],
  },
]);

// ============================================================
// ROOT
// ============================================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoginProvider>
      <RouterProvider router={router} />
    </LoginProvider>
  </StrictMode>
);