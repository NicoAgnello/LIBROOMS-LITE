// mainSala.js

window.addEventListener('DOMContentLoaded', () => {
  // Conexión Socket.IO
  const socket = io();

  // Helpers LocalStorage
  const getLocaleStorage = key => localStorage.getItem(key);




  // 1. Recuperar nombre de sala guardado
  const room = localStorage.getItem('salaActual') || 'general';
  const alias = localStorage.getItem('alias')
  // 2. Mostrar nombre de sala en el encabezado
  const roomNameEl = document.getElementById('room-name');
  if (roomNameEl) {
    roomNameEl.textContent = `Sala: ${room}`;
  }

  
  // 3. Unirse al room en el servidor (re-emisión para el nuevo socket)
/*
  const alias = getLocaleStorage('alias') || 'Anónimo';
  socket.emit('unirseSala', {
    nombreSala: room,
    privada: false,
    contrasena: '', 
    alias
  });
*/

// 1. ¿Vengo de crear una sala privada?
let salaPayload = null;
const raw = sessionStorage.getItem('salaJoinData');
if (raw) {
  salaPayload = JSON.parse(raw);
   // ya no lo necesitamos
  sessionStorage.removeItem('salaJoinData');
} else {
   // join “normal” (pública o general)
  salaPayload = {
    nombreSala: localStorage.getItem('salaActual') || 'General',
    privada: false,
    contrasena: '',
    alias: alias
  };
}
 // Mostrar nombre de sala en el header
document.getElementById('room-name').textContent = `Sala: ${salaPayload.nombreSala}`;
 // 2. Emitir la solicitud de unión correcta
socket.emit('unirseSala', salaPayload);



  // 4. Enviar mensaje
  const enviarMensaje = () => {
    const inputMensaje = document.getElementById('inputMensaje');
    const mensajeValue = inputMensaje.value.trim();
    if (!mensajeValue) return;
    socket.emit('mensajeChat', { value: mensajeValue, room , alias});
    inputMensaje.value = '';
  };

  document
    .getElementById('botonEnviarMensaje')
    .addEventListener('click', enviarMensaje);

  document
    .getElementById('inputMensaje')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        enviarMensaje();
      }
    });

  // 5. Recibir y mostrar mensajes
  const chatLog = document.getElementById('chat-log');
  socket.on('mensajeChat', mensaje => {
    const li = document.createElement('li');
    li.classList.add('chat-message');
    li.innerHTML = `
      <span class="msg-time">[${mensaje.hora}]</span>
      <span class="msg-alias">${mensaje.alias}:</span>
      <span class="msg-value">${mensaje.value}</span>
    `;
    chatLog.appendChild(li);
    chatLog.scrollTop = chatLog.scrollHeight;
  });

    // 6. Recibir y renderizar usuarios conectados
  const listaUsuarios = document.querySelector('.lista-usuarios');

  socket.on('actualizarUsuarios', (usuarios) => {
    listaUsuarios.innerHTML = ''; // Limpiar lista
    usuarios.forEach(alias => {
      const li = document.createElement('li');
      li.textContent = "  🟢  " + alias;
      listaUsuarios.appendChild(li);
    });
  });
});
