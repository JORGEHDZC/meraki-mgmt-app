// src/components/PrivateRoute.jsx

import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, setAuthError } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      // Establecer el error solo cuando el usuario intente acceder a una página protegida
      setAuthError("Error, no estás autenticado.");
    }
  }, [user, setAuthError]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
