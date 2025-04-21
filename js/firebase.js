import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqGCqKnAE4q1JIBMTB1ed7scU-TbJ11vs",
  authDomain: "twitter-95315.firebaseapp.com",
  databaseURL: "https://twitter-95315-default-rtdb.firebaseio.com",
  projectId: "twitter-95315",
  storageBucket: "twitter-95315.firebasestorage.app",
  messagingSenderId: "994645037657",
  appId: "1:994645037657:web:ef23d4c30a50334f5f9748"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
