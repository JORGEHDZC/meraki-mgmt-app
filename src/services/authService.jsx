// src/services/authService.js

import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

// Función para registrar al usuario en la colección de "pendingUsers"
export const registerService = async (email, password) => {
  const db = getFirestore();
  try {
    // Almacena los datos en una colección "pendingUsers" en Firestore para aprobación
    await addDoc(collection(db, 'pendingUsers'), {
      email,
      password, // Considera encriptar el password en un proyecto real
      approved: false,
      requestedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error al registrar el usuario para aprobación:', error);
    return false;
  }
};

// Función para iniciar sesión con Firebase Authentication
export const loginService = async (email, password) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { token };
  } catch (error) {
    throw error; // Si hay un error, lanzamos el error para manejarlo en el contexto
  }
};

// Función para cerrar sesión con Firebase Authentication
export const logoutService = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

// Función para obtener todos los usuarios pendientes de aprobación
export const getPendingUsers = async () => {
  const db = getFirestore();
  try {
    const querySnapshot = await getDocs(collection(db, 'pendingUsers'));
    const pendingUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return pendingUsers;
  } catch (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    return [];
  }
};

// Función para aprobar un usuario pendiente
export const approveUserService = async (user) => {
  const db = getFirestore();
  try {
    // Almacena los datos en una colección "approvedUsers" en Firestore 
    await addDoc(collection(db, 'approvedUsers'), {
      email,
      password, // Considera encriptar el password en un proyecto real
      approved: true,
      requestedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error  el usuario para aprobación:', error);
    return false;
  }
};
