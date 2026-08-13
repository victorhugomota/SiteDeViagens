import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase fornecida no projeto
const firebaseConfig = {
  apiKey: "AIzaSyD4_NPMjW6eiBHgNzaJNIKNLyMLY1tDLhg",
  authDomain: "sitedeviagens-f1aaa.firebaseapp.com",
  projectId: "sitedeviagens-f1aaa",
  storageBucket: "sitedeviagens-f1aaa.firebasestorage.app",
  messagingSenderId: "897898505783",
  appId: "1:897898505783:web:cc53af95d0819500f681b2",
  measurementId: "G-0Y7BTJPTQM"
};

// Inicializa a aplicação Firebase
export const app = initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore
export const db = getFirestore(app);

// Inicializa Analytics se suportado
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
