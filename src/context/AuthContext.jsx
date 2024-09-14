// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { loginService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si el usuario está autenticado, obtenemos su token
        user.getIdToken().then((token) => {
          setUser({ token });
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup function para evitar memory leaks
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      setUser({ token: data.token });
      return true; // Login exitoso
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false; // Login fallido
    }
  };

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
