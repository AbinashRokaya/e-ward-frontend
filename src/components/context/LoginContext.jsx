import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  // User is logged out by default
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
