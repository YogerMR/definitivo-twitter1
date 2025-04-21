import { db } from './firebase.js';
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, updateDoc, orderBy, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Recuperar el email del usuario desde sessionStorage
const userEmail = sessionStorage.getItem("userEmail");
if (!userEmail) {
  console.error("No se encontró el email en sessionStorage. Redirigiendo a login...");
  window.location.href = "home.html";
}

let userId = null; // Variable global para almacenar el ID del usuario actual
let currentChatId = null; // Variable global para almacenar el chat actual

// Referencias a elementos del DOM
const usersContainer = document.getElementById("usersContainer");
const chatsContainer = document.getElementById("chatsContainer");
const messagesContainer = document.getElementById("messagesContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

// Función para cargar el ID del usuario actual desde Firestore
const loadUserIdFromFirestore = async () => {
  try {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      console.log("Usuario encontrado:", userId);
    } else {
      console.error("No se encontró ningún usuario con el correo:", userEmail);
      alert("No se encontró el usuario. Redirigiendo a login...");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error al cargar el usuario desde Firestore:", error);
    alert("Ocurrió un error al cargar los datos del usuario. Intenta nuevamente.");
    window.location.href = "login.html";
  }
};

// Función para cargar los chats del usuario
const loadChats = async () => {
  try {
    if (!userId) {
      console.error("No se encontró userId. Asegúrate de haber cargado el usuario.");
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participantes", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    chatsContainer.innerHTML = ""; // Limpiar lista de chats

    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      const chatId = doc.id;

      // Excluir al usuario actual para mostrar el ID del otro participante
      const otherUserId = chatData.participantes.find((id) => id !== userId);

      const chatElement = document.createElement("div");
      chatElement.classList.add("chat");
      chatElement.innerHTML = `
        <p><strong>Chat con:</strong> ${otherUserId}</p>
        <p><strong>Último mensaje:</strong> ${chatData.ultimoMensaje || "Sin mensajes"}</p>
        <p><small>Última actividad: ${chatData.actualizadoEn?.toDate().toLocaleString() || "N/A"}</small></p>
      `;
      chatElement.addEventListener("click", () => openChat(chatId, otherUserId));

      chatsContainer.appendChild(chatElement);
    });

    if (!chatsContainer.hasChildNodes()) {
      chatsContainer.innerHTML = "<p>No tienes chats aún.</p>";
    }
  } catch (error) {
    console.error("Error al cargar los chats:", error);
    chatsContainer.innerHTML = "<p>Error al cargar los chats.</p>";
  }
};

// Función para cargar los usuarios disponibles desde Firestore
const loadUsers = async () => {
  try {
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef); // Cargar todos los usuarios
    const querySnapshot = await getDocs(q);

    usersContainer.innerHTML = ""; // Limpiar el contenedor de usuarios

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const otherUserId = doc.id;

      // Excluir al usuario actual
      if (otherUserId === userId) return;

      // Crear un elemento para cada usuario
      const userElement = document.createElement("div");
      userElement.classList.add("user");
      userElement.innerHTML = `
        <p><strong>${userData.nombreUsuario || "Usuario sin nombre"}</strong></p>
      `;
      userElement.addEventListener("click", () => startChatWithUser(otherUserId));

      usersContainer.appendChild(userElement);
    });

    // Si no hay usuarios disponibles
    if (!usersContainer.hasChildNodes()) {
      usersContainer.innerHTML = "<p class='empty'>No hay usuarios disponibles.</p>";
    }
  } catch (error) {
    console.error("Error al cargar los usuarios:", error);
    usersContainer.innerHTML = "<p class='empty'>Error al cargar los usuarios.</p>";
  }
};

// Función para iniciar un chat con otro usuario
const startChatWithUser = async (otherUserId) => {
  try {
    console.log("Iniciando chat con el usuario:", otherUserId);

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participantes", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    let chatId = null;

    // Verificar si ya existe un chat con este usuario
    querySnapshot.forEach((doc) => {
      const chat = doc.data();
      if (chat.participantes.includes(otherUserId)) {
        chatId = doc.id;
      }
    });

    // Crear un nuevo chat si no existe
    if (!chatId) {
      console.log("No existe un chat con este usuario. Creando uno nuevo...");
      const newChatDoc = await addDoc(chatsRef, {
        participantes: [userId, otherUserId],
        ultimoMensaje: "",
        actualizadoEn: Timestamp.now(),
      });
      chatId = newChatDoc.id;
      console.log("Nuevo chat creado con ID:", chatId);
    }

    openChat(chatId, otherUserId);
  } catch (error) {
    console.error("Error al iniciar o abrir el chat:", error);
  }
};

// Función para abrir un chat y cargar los mensajes
const openChat = (chatId, otherUserId) => {
  currentChatId = chatId; // Establece el chat actual
  console.log("Chat abierto con ID:", currentChatId);

  messagesContainer.innerHTML = `<p class="empty">Cargando mensajes...</p>`;

  const messagesRef = collection(db, `chats/${chatId}/mensajes`);
  const q = query(messagesRef, orderBy("creadoEn", "asc")); // Ordenar por fecha

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = ""; // Limpiar mensajes

    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", message.idUsuario === userId ? "sent" : "received");
      messageElement.innerHTML = `
        <p>${message.contenido}</p>
        <p class="timestamp">${message.creadoEn?.toDate().toLocaleString()}</p>
      `;

      messagesContainer.appendChild(messageElement);
    });

    if (!messagesContainer.hasChildNodes()) {
      messagesContainer.innerHTML = `<p class="empty">No hay mensajes en este chat aún. ¡Envía el primer mensaje!</p>`;
    }
  });
};

// Función para enviar un mensaje
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentChatId) {
    alert("Selecciona un usuario o un chat primero.");
    return;
  }

  const messageContent = messageInput.value.trim();
  if (!messageContent) {
    alert("El mensaje no puede estar vacío.");
    return;
  }

  try {
    const chatRef = doc(db, "chats", currentChatId);
    const messagesRef = collection(db, `chats/${currentChatId}/mensajes`);

    await addDoc(messagesRef, {
      idUsuario: userId,
      contenido: messageContent,
      creadoEn: Timestamp.now(),
      leido: false,
    });

    await updateDoc(chatRef, {
      ultimoMensaje: messageContent,
      actualizadoEn: Timestamp.now(),
    });

    messageInput.value = ""; // Limpiar input
    console.log("Mensaje enviado:", messageContent);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
});

// Inicializar
const init = async () => {
  await loadUserIdFromFirestore(); // Cargar el ID del usuario actual
  loadChats(); // Cargar chats
  loadUsers(); // Cargar usuarios disponibles
};

init();
