import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

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
  const auth = getAuth();
  try {
    // Crear la cuenta del usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

    // Mover el usuario a la colección "approvedUsers" en Firestore
    await addDoc(collection(db, 'approvedUsers'), {
      email: user.email,
      approvedAt: new Date(),
      active: true,
      uid: userCredential.user.uid // Guardamos el UID del usuario creado en Authentication
    });

    // Eliminar el usuario de la colección "pendingUsers"
    await deleteDoc(doc(db, 'pendingUsers', user.id));

    return true; // Si todo sale bien, retornamos true
  } catch (error) {
    console.error('Error al aprobar el usuario:', error);
    throw error;
  }
};

// Función para actualizar el estado de un usuario aprobado a inactivo
export const setInactiveService = async (userId) => {
  const db = getFirestore();
  try {
    const userRef = doc(db, 'approvedUsers', userId);
    await updateDoc(userRef, { active: false });
    console.log(`Usuario con ID ${userId} ha sido marcado como inactivo.`);
  } catch (error) {
    console.error("Error al marcar el usuario como inactivo:", error);
  }
};

// Función para eliminar un usuario aprobado
export const deleteApprovedUserService = async (userId) => {
  const db = getFirestore();
  try {
    await deleteDoc(doc(db, 'approvedUsers', userId));
    console.log(`Usuario con ID ${userId} ha sido eliminado de approvedUsers.`);
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
  }
};
