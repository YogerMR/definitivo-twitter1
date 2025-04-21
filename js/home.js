import { db } from './firebase.js';
import { addDoc, collection, query, orderBy, onSnapshot, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const tweetForm = document.getElementById('tweetForm');
const tweetContent = document.getElementById('tweetContent');
const tweetImage = document.getElementById('tweetImage');
const tweetsContainer = document.getElementById('tweetsContainer');
const logoutButton = document.getElementById('logoutButton');

const currentUserEmail = sessionStorage.getItem('userEmail');
if (!currentUserEmail) {
  console.log('No hay usuario en sesión, redirigiendo a login...');
  window.location.href = 'login.html';
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Publicar un tweet
tweetForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validar contenido del tweet
  if (!tweetContent.value.trim()) {
    alert('El contenido del tweet no puede estar vacío.');
    return;
  }

  try {
    // Buscar el usuario en Firestore para obtener su ID
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('email', '==', currentUserEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Usuario no encontrado en Firestore.');
    }

    // Obtener el ID del usuario
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Convertir la imagen a Base64 si existe
    let base64Image = [];
    if (tweetImage.files.length > 0) {
      base64Image = [await fileToBase64(tweetImage.files[0])];
    }

    // Crear un nuevo tweet
    await addDoc(collection(db, 'tweets'), {
      idUsuario: userDoc.id,
      contenido: tweetContent.value,
      imagenes: base64Image, // Guardar la imagen en Base64
      creadoEn: new Date(),
      likes: 0,
      retweets: 0,
      respuestas: 0,
    });

    console.log('Tweet publicado exitosamente.');
    tweetForm.reset(); 
  } catch (error) {
    console.error('Error al publicar el tweet:', error);
    alert('Ocurrió un error al publicar el tweet. Intenta nuevamente.');
  }
});

// Cargar tweets y mostrarlos en el feed
const loadTweets = () => {
  const q = query(collection(db, 'tweets'), orderBy('creadoEn', 'desc'));
  onSnapshot(q, (snapshot) => {
    tweetsContainer.innerHTML = ''; // Limpiar feed
    snapshot.forEach((doc) => {
      const tweet = doc.data();
      displayTweet(tweet);
    });
  });
};

// Mostrar un tweet en el feed
const displayTweet = (tweet) => {
    const tweetElement = document.createElement('div');
    tweetElement.classList.add('tweet', 'bg-white', 'rounded', 'shadow', 'p-4', 'mb-4');

    tweetElement.innerHTML = `
        <p class="font-bold text-blue-500">@${tweet.idUsuario}</p>
        <p class="text-gray-700 mb-2">${tweet.contenido}</p>
        ${tweet.imagenes && tweet.imagenes.length > 0 
            ? `<img src="${tweet.imagenes[0]}" alt="Imagen del tweet" class="rounded mt-2" style="max-width: 100%;">` 
            : ''}
        <div class="tweet-actions mt-2 text-gray-500 flex justify-between text-sm">
            <span>❤️ ${tweet.likes} Likes</span>
            <span>🔁 ${tweet.retweets} Retweets</span>
            <span>💬 ${tweet.respuestas} Respuestas</span>
        </div>
    `;

    tweetsContainer.appendChild(tweetElement);
};

// Cerrar sesión
logoutButton.addEventListener('click', () => {
  // Limpiar datos de sesión y redirigir
  sessionStorage.clear();
  console.log('Usuario desconectado.');
  window.location.href = 'login.html';
});

// Cargar tweets en el feed al cargar la página
loadTweets();
