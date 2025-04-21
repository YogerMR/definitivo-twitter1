import { db } from './firebase.js';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Recuperar email desde sessionStorage
const userEmail = sessionStorage.getItem("userEmail");
if (!userEmail) {
  console.error("No se encontró userEmail en sessionStorage. Redirigiendo a login...");
  window.location.href = "home.html"; // Redirigir si no hay sesión
}

const userNameElem = document.getElementById("userName");
const userBioElem = document.getElementById("userBio");
const editProfileModal = document.getElementById("editProfileModal");
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const newUserNameInput = document.getElementById("newUserName");
const newUserBioInput = document.getElementById("newUserBio");

let userId = null; 

// Buscar usuario en Firestore y cargar su perfil
const loadUserProfile = async () => {
  try {
    // Buscar documento en la colección 'usuarios' donde el email coincida
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Obtener el primer documento encontrado
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id; 
      const userData = userDoc.data(); 

      // Mostrar datos en la página
      userNameElem.innerText = userData.nombreUsuario;
      userBioElem.innerText = userData.biografia || "Sin biografía.";
    } else {
      console.error("Usuario no encontrado en Firestore.");
      alert("Hubo un problema al cargar el perfil. Intenta nuevamente.");
    }
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  }
};

// Mostrar el modal
editProfileBtn.addEventListener("click", () => {
  if (!userId) {
    alert("No se pudo cargar el perfil. Intenta nuevamente.");
    return;
  }
  editProfileModal.style.display = "flex";
  newUserNameInput.value = userNameElem.innerText;
  newUserBioInput.value = userBioElem.innerText !== "Sin biografía." ? userBioElem.innerText : "";
});

// Cerrar el modal
closeModalBtn.addEventListener("click", () => {
  editProfileModal.style.display = "none";
});

// Guardar cambios en el perfil
saveProfileBtn.addEventListener("click", async () => {
  const newUserName = newUserNameInput.value.trim();
  const newUserBio = newUserBioInput.value.trim();

  if (!newUserName) {
    alert("El nombre de usuario no puede estar vacío.");
    return;
  }

  try {
    if (!userId) throw new Error("No se encontró userId para actualizar el perfil.");

    const userRef = doc(db, "usuarios", userId);
    await updateDoc(userRef, {
      nombreUsuario: newUserName,
      biografia: newUserBio,
    });

    // Actualizar la página con los nuevos datos
    userNameElem.innerText = newUserName;
    userBioElem.innerText = newUserBio || "Sin biografía.";
    alert("Perfil actualizado exitosamente.");

    // Cerrar el modal
    editProfileModal.style.display = "none";
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    alert("Ocurrió un error al guardar los cambios. Intenta nuevamente.");
  }
});

// Cargar datos al abrir la página
loadUserProfile();
