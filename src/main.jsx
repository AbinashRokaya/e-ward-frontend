import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BirthRegistration from "./pages/BirthRegistration.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Preview from "./components/Preview.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import NoticeBoard from "./pages/NoticeBoard.jsx";

import Admin from "./components/admin/Admin.jsx";
import DataValidation from "./components/datavalidation/DataValidation.jsx";
import Citizen from "./components/citizen/Citizen.jsx";
import WardChairperson from "./components/ward_chairperson/WardChairperson.jsx";
import WardSecretary from "./components/ward_secretary/WardSecretary.jsx";
import Header from "./components/header/Header.jsx";
import App from "./App.jsx";
import { LoginProvider } from "./components/context/LoginContext.jsx";
// import NoticeManagement from "./components/notice/Noticemanagement.jsx";
import NoticeManagement from "./components/notice/NoticeManagement.jsx";
import AuthPage from "./pages/Authpage.jsx";
import Home from "./pages/Home.jsx";
import Birth_certificate from "./components/Birth_certificate.jsx";
import DeathRegistration from "./pages/Deathregistration.jsx";
import CertificateHome from "./components/citizen/Certificatehome.jsx";
import AdminHome from "./components/admin/Adminhome.jsx";
import MigrationRegistration from "./pages/MigrationRegistration.jsx";
import DataValidationHome from "./components/datavalidation/DataValidationHome.jsx";
import WardChairpersonHome from "./components/ward_chairperson/WardChairpersonHome.jsx";
import WardSecretaryHome from "./components/ward_secretary/WardSecretaryHome.jsx";
import ComplaintBoard from "./pages/ComplaintBoard.jsx";
import FileComplaint from "./pages/FileComplaint.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
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
      // Admin Routes
      {
        path: "/admin/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin/users",
        element: <Users />,
      },
      {
        path: "/admin",
        element: <AdminHome />,
      },
      {
        path: "/validation",
        element: <DataValidationHome />,
      },
      {
        path: "/citizen",
        element: <CertificateHome />,
      },
      {
        path: "/wardchairperson",
        element: <WardChairpersonHome />,
      },
      {
        path: "/wardsecretary",
        element: <WardSecretaryHome />,
      },
      {
        path: "/notice-management",
        element: <NoticeManagement />,
      },
      {
        path: "/certi",
        element: <Birth_certificate />,
      },
      {
        path: "/death",
        element: <DeathRegistration />,
      },
      {
        path: "/migration",
        element: <MigrationRegistration />,
      },
      {
        path: "/complaint",
        element: <ComplaintBoard />,
      },
      {
        path: "/complaint-file",
        element: <FileComplaint />,
      },
      {
        path: "/verify/:id",
        element: <VerifyCertificate />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoginProvider>
      <RouterProvider router={router} />
    </LoginProvider>
  </StrictMode>,
);
