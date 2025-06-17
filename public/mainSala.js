// mainSala.js

window.addEventListener('DOMContentLoaded', () => {
  // Conexión Socket.IO
  const socket = io();

  // Helpers LocalStorage
  const getLocaleStorage = key => localStorage.getItem(key);

  // 1. Recuperar nombre de sala guardado
  const room = localStorage.getItem('salaActual') || 'general';

  // 2. Mostrar nombre de sala en el encabezado
  const roomNameEl = document.getElementById('room-name');
  if (roomNameEl) {
    roomNameEl.textContent = `Sala: ${room}`;
  }

  // 3. Unirse al room en el servidor (re-emisión para el nuevo socket)
  const alias = getLocaleStorage('alias') || 'Anónimo';
  socket.emit('unirseSala', {
    nombreSala: room,
    privada: false,
    contraseña: '',
    alias
  });

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
