// context/UserContext.js
"use client";
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext({
  role: null,
  setRole: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserRole = () => useContext(UserContext); // Pastikan ini diekspor sebagai const function
export default UserContextProvider;