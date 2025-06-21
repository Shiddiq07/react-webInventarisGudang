// contexts/AuthContext.js
'use client';
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek apakah ada token di cookie saat aplikasi pertama kali dimuat
    const token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME);
    if (token) {
      // Di sini Anda mungkin perlu melakukan permintaan ke backend
      // untuk memvalidasi token dan mendapatkan informasi pengguna (termasuk role)
      // Untuk contoh sederhana, kita asumsikan token valid dan kita bisa mendekode role dari token (hati-hati dengan keamanan)
      const decodedUser = { id: '123', email: 'user@example.com', role: 'user' }; // Contoh data
      setUser(decodedUser);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    console.log('Login berhasil:', userData);
    // Simpan token di cookie (dilakukan di backend saat login berhasil)
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    Cookies.remove(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME);
    // Redirect ke halaman login
  };

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};