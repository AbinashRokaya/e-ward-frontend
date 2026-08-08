import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../components/context/LoginContext";
import CertificateHome from "../components/citizen/Certificatehome";

// Login-gated "my form status" page. Reuses CertificateHome, which already
// covers birth / death / migration / recommendation / complaint / notices /
// tax — each with its own status view via CertificateManager.
function FormStatus() {
  const loginContext = useContext(LoginContext) || {};
  const isLogin = loginContext.isLogin ?? false;

  if (!isLogin) {
    return <Navigate to="/login" replace state={{ from: "/reports" }} />;
  }

  return <CertificateHome />;
}

export default FormStatus;