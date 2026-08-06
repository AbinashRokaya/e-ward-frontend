import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [userRole, setRole] = useState("Citizen");
  const [isLogin, setisLogin] = useState(true);
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
