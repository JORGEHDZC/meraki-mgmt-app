// src/components/auth/LoginForm.jsx

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { AuthContext } from '../../context/AuthContext';

const LoginForm = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate(); // Inicializa useNavigate

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await login(email, password);
      setFormError(null);
      // Redirige al usuario a la página /dashboard después del inicio de sesión exitoso
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo electrónico"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        {formError && <div className="error-message">{formError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p>
        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginForm;
