import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  // Rehydrate from localStorage so a page refresh doesn't wipe the session.
  // The real authentication is the httpOnly access_token cookie the backend
  // sets on login — this is only so the UI knows who's signed in without an
  // extra round-trip. AuthPage writes these keys on successful login.
  const [userRole, setRole] = useState(
    () => localStorage.getItem("userRole") || null,
  );
  const [isLogin, setisLogin] = useState(
    () => Boolean(localStorage.getItem("userRole")),
  );

  // Single place that clears both context and localStorage, so no screen can
  // log out of one but not the other.
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setisLogin(false);
    setRole(null);
  };

  return (
    <LoginContext.Provider
      value={{
        isLogin,
        setisLogin,
        userRole,
        setRole,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};