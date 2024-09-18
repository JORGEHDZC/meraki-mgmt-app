// src/components/PrivateRoute.jsx

import React, { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      // Si no está autenticado, mostrar el mensaje de error brevemente
      setError(true);
      setTimeout(() => {
        setError(false); // Ocultar el mensaje antes de la redirección
      }, 3000);
    }
  }, [user]);

  if (!user) {
    return (
      <>
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
            Error, no estás autenticado.
          </div>
        )}
        <Navigate to="/" />
      </>
    );
  }

  return children;
};

export default PrivateRoute;
