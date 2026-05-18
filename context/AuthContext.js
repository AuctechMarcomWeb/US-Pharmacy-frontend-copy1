

"use client";

import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);



  // LOGIN
  const login = (userData, token) => {
  

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
