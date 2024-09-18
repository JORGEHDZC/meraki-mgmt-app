// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { loginService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // Estado para manejar el error de autenticación

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          setUser({ token });
          setAuthError(null); // Limpiar error si el usuario está autenticado
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      setUser({ token: data.token });
      setAuthError(null); // Limpiar cualquier error anterior al iniciar sesión correctamente
      return true;
    } catch (error) {
      setAuthError("Credenciales incorrectas, por favor verifica.");
      console.error("Error al iniciar sesión:", error);
      return false;
    }
  };

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      setAuthError(null); // Limpiar cualquier error al cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Limpiar el mensaje de error después de 3 segundos
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null); // Limpiar el mensaje después de 3 segundos
      }, 1000);
      return () => clearTimeout(timer); // Limpiar el timeout al desmontar
    }
  }, [authError]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, authError, setAuthError }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
