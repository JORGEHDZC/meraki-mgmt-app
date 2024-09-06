// src/services/authService.jsx

import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Servicio para iniciar sesión
export const loginService = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // El usuario está autenticado, el token está disponible en userCredential
    const token = await userCredential.user.getIdToken();
    
    // Almacenar el token en localStorage o manejarlo de otra forma
    localStorage.setItem('authToken', token);

    return { token };
  } catch (error) {
    console.error('Error en la autenticación:', error.message);
    return null;
  }
};

// Servicio para registrar un nuevo usuario
export const registerService = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // El usuario ha sido creado exitosamente
      const token = await userCredential.user.getIdToken();
  
      // Almacenar el token en localStorage o manejarlo como desees
      localStorage.setItem('authToken', token);
  
      return { token };
    } catch (error) {
      console.error('Error al registrar el usuario:', error.message);
      return null;
    }
  };

// Servicio para cerrar sesión
export const logoutService = async () => {
  try {
    await signOut(auth);
    // Eliminar el token almacenado
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
  }
};

// Servicio para obtener el token almacenado
export const getAuthToken = () => {
  // Recuperar el token desde localStorage
  return localStorage.getItem('authToken');
};
