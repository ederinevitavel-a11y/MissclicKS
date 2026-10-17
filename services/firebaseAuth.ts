import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBRonozdG3bLJLVqqAhfEu1_hwgSXWbHsg",
  authDomain: "gen-lang-client-0675407474.firebaseapp.com",
  projectId: "gen-lang-client-0675407474",
  storageBucket: "gen-lang-client-0675407474.firebasestorage.app",
  messagingSenderId: "9136833788",
  appId: "1:9136833788:web:98b8f2b04e4ac9ba174379"
};

// Só inicializa se a API Key estiver presente
export const auth = firebaseConfig.apiKey ? getAuth(initializeApp(firebaseConfig)) : null;
export const googleProvider = firebaseConfig.apiKey ? new GoogleAuthProvider() : null;

