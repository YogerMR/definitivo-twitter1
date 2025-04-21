import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqGCqKnAE4q1JIBMTB1ed7scU-TbJ11vs",
  authDomain: "twitter-95315.firebaseapp.com",
  databaseURL: "https://twitter-95315-default-rtdb.firebaseio.com",
  projectId: "twitter-95315",
  storageBucket: "twitter-95315.firebasestorage.app",
  messagingSenderId: "994645037657",
  appId: "1:994645037657:web:ef23d4c30a50334f5f9748"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Al enviar el formulario de inicio de sesión
document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Capturar datos del formulario
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // Buscar usuario en Firestore con el email y contraseña proporcionados
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", email), where("contraseña", "==", password)); 
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Usuario encontrado
      alert("¡Inicio de sesión exitoso!");

      // Guardar el email en sessionStorage
      sessionStorage.setItem("userEmail", email);
  
      // Redirigir a la página de inicio
      window.location.href = "home.html";
    } else {
      alert("Correo o contraseña incorrectos. Intenta nuevamente.");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Hubo un error al iniciar sesión. Por favor, inténtalo de nuevo.");
  }
});
