import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../components/context/LoginContext";
import AdminHome from "../components/admin/Adminhome";
import WardSecretaryHome from "../components/ward_secretary/WardSecretaryHome";
import WardChairpersonHome from "../components/ward_chairperson/WardChairpersonHome";
import DataValidationHome from "../components/datavalidation/DataValidationHome";
import Citizen from "../components/citizen/Citizen";

// Single "/dashboard" route. Whoever lands here sees the home screen that
// matches their role, so Login.jsx and Header.jsx only ever need to link
// to one place instead of one route per role.
function Dashboard() {
  const loginContext = useContext(LoginContext) || {};
  const isLogin = loginContext.isLogin ?? false;
  const userRole = loginContext.userRole;

  // Not logged in at all — bounce to login instead of showing any dashboard.
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  switch (userRole) {
    case "admin":
      return <AdminHome />;
    case "wardsecretary":
      return <WardSecretaryHome />;
    case "wardchairperson":
      return <WardChairpersonHome />;
    case "datavalidationofficer":
      return <DataValidationHome />;
    case "citizen":
    default:
      return <Citizen />;
  }
}

export default Dashboard;