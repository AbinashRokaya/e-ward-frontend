import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  // Fixed: this used to default isLogin to `true` and userRole to
  // "Citizen", so every visitor looked "logged in" before ever touching
  // the login form. Real logged-out state now starts as null/false.
  const [userRole, setRole] = useState(null);
  const [isLogin, setisLogin] = useState(false);

  return (
    <LoginContext.Provider
      value={{
        isLogin,
        setisLogin,
        userRole,
        setRole,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};