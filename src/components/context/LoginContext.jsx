import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  // Rehydrate from localStorage so a page refresh doesn't wipe the session.
  // The real authentication is the httpOnly access_token cookie the backend
  // sets on login — this is only so the UI knows who's signed in without an
  // extra round-trip.
  const [userRole, setRole] = useState(
    () => localStorage.getItem("userRole") || null,
  );
  const [isLogin, setisLogin] = useState(
    () => Boolean(localStorage.getItem("userRole")),
  );

  // Single place that writes both context and localStorage, mirroring
  // logout below. AuthPage can call this instead of setting the three
  // localStorage keys itself, so the write and clear paths can't drift
  // apart (e.g. logout clearing a key that login never set).
  //
  // `token` is optional — the backend delivers auth via an httpOnly cookie,
  // so the response body may not contain a token at all.
  const login = (userData, token) => {
    const role = userData?.user_role || userData?.role || "citizen";

    if (token) localStorage.setItem("token", token);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", role);

    setisLogin(true);
    setRole(role);

    return role;
  };

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
        login,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};