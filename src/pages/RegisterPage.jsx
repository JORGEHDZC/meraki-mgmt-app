// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { registerService } from '../services/authService';
import { useNavigate } from 'react-router-dom'; // To navigate back

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate for redirection

  const handleRegister = async (e) => {
    e.preventDefault();

    const result = await registerService(email, password);

    if (result) {
      console.log('Usuario registrado con éxito');
      // Redirige o realiza alguna acción
    } else {
      setError('Error al registrar el usuario');
    }
  };

  const handleCancel = () => {
    navigate("/"); // Navigate back to the home page
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
        {error && (
          <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
