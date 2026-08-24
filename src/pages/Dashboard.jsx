import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../components/context/LoginContext";
import AdminHome from "../components/admin/Adminhome";
import WardSecretaryHome from "../components/ward_secretary/WardSecretaryHome";
import WardChairpersonHome from "../components/ward_chairperson/WardChairpersonHome";
import DataValidationHome from "../components/datavalidation/DataValidationHome";
import CertificateHome from "../components/citizen/Certificatehome";

// Single "/dashboard" route that renders whichever role home matches the
// logged-in user. The app also routes each role home directly (/admin,
// /citizen, /wardsecretary, ...), so this is a convenience entry point —
// delete this file and its route if you'd rather keep only the flat routes.
function Dashboard() {
  const loginContext = useContext(LoginContext) || {};
  const isLogin = loginContext.isLogin ?? false;
  const userRole = loginContext.userRole;

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole) {
    // Backend role enum is "superadmin", not "admin" — this previously read
    // "admin", never matched, and silently showed admins the citizen view.
    case "superadmin":
      return <AdminHome />;
    case "wardsecretary":
      return <WardSecretaryHome />;
    case "wardchairperson":
      return <WardChairpersonHome />;
    case "datavalidationofficer":
      return <DataValidationHome />;
    case "citizen":
    default:
      return <CertificateHome />;
  }
}

export default Dashboard;