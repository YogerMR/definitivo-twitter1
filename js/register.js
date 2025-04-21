import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Manejar el envío del formulario de registro
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Evitar la recarga de la página

  // Capturar datos del formulario
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Crear un ID único para el usuario
    const idUsuario = Date.now().toString(); 

    // Guardar datos en Firestore
    await setDoc(doc(db, "usuarios", idUsuario), {
      nombreUsuario: name,
      email: email,
      contraseña: password,
      creadoEn: new Date(),
      contadorTweets: 0,
      contadorSeguidores: 0,
      contadorSiguiendo: 0,
    });

    alert("¡Usuario registrado exitosamente!");
    document.getElementById("registerForm").reset(); // Limpiar el formulario
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Hubo un error al registrar el usuario. Por favor, inténtalo de nuevo.");
  }
});
