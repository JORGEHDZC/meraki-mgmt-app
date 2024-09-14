import React, { useState } from 'react';
import { registerService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material'; // Importamos Snackbar y Alert de Material UI

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para controlar el Snackbar
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const result = await registerService(email, password);

    if (result) {
      setSuccess('Solicitud de registro enviada para aprobación.');
      setError('');
      setSnackbarOpen(true); // Abrimos el Snackbar

      // Cerramos el Snackbar después de 1500ms y navegamos de vuelta a la página de inicio de sesión
      setTimeout(() => {
        setSnackbarOpen(false);
        navigate("/");
      }, 1500);
    } else {
      setError('Error al registrar el usuario');
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="container mx-auto max-w-md mt-8">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Registrarse</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="submit"
              className="w-1/2 p-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 mr-2"
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-1/2 p-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
        
        {/* Snackbar para mostrar mensajes de éxito */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={1500}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default RegisterPage;
