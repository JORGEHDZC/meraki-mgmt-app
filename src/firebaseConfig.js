import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA83X8MayBaeMnGo7YaIXYrUb4CnzpqHuA",
  authDomain: "meraki-app-63ea0.firebaseapp.com",
  projectId: "meraki-app-63ea0",
  storageBucket: "meraki-app-63ea0.appspot.com",
  messagingSenderId: "388612626340",
  appId: "1:388612626340:web:b3ae82b8250123732bd331",
  measurementId: "G-M05YVTYFDJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);