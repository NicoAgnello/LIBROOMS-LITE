// mainSala.js

window.addEventListener('DOMContentLoaded', () => {
  // 📡 Establecer conexión con el servidor vía Socket.IO
  const socket = io();

  // 🧰 Helper para obtener valores del localStorage
  const getLocaleStorage = key => localStorage.getItem(key);


  // 📝 Obtener el nombre de la sala actual desde localStorage
  const room = localStorage.getItem('salaActual') || 'general';

  // Obtener el alias guardado del usuario
  const alias = localStorage.getItem('alias');

  // 🖼️ Mostrar el nombre de la sala en el encabezado de la página
  const roomNameEl = document.getElementById('room-name');
  if (roomNameEl) {
    roomNameEl.textContent = `Sala: ${room}`;
  }

  // 🔁 Intentar unirse a la sala automáticamente al cargar la página

  // ✅ Paso 1: Ver si hay datos de sesión almacenados de una sala reciente
  let salaPayload = null;
  const raw = sessionStorage.getItem('salaJoinData');
  if (raw) {
    // Si existen, los parseamos y los usamos para emitir el unirseSala
    salaPayload = JSON.parse(raw);
    sessionStorage.removeItem('salaJoinData');
    socket.emit('unirseSala', salaPayload);
  } else {
    // Si no hay datos, no enviamos nada para evitar errores
    console.warn('⚠️ No se encontró salaJoinData. No se enviará unirseSala.');
    return;
  }

  // Mostrar nombre de la sala en el encabezado (seguro)
  document.getElementById('room-name').textContent = `Sala: ${salaPayload.nombreSala}`;

  // (Ya hicimos emit más arriba, no se repite)


  // 💬 Función para enviar mensaje al chat
  const enviarMensaje = () => {
    const inputMensaje = document.getElementById('inputMensaje');
    const mensajeValue = inputMensaje.value.trim();
    
    if (!mensajeValue) return;
    

    // Emitimos el mensaje con info de sala y alias
    socket.emit('mensajeChat', { value: mensajeValue, room, alias });
    inputMensaje.value = '';
  };

  // 📤 Enviar mensaje al hacer clic en el botón
  document
    .getElementById('botonEnviarMensaje')
    .addEventListener('click', enviarMensaje);

  // ⌨️ Enviar mensaje con Enter en el input
  document
    .getElementById('inputMensaje')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        enviarMensaje();
      }
    });

  // 📥 Recibir y mostrar mensajes del servidor
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

  // 👥 Recibir y renderizar lista de usuarios conectados en la sala
  const listaUsuarios = document.querySelector('.lista-usuarios');

  socket.on('actualizarUsuarios', (usuarios) => {
    listaUsuarios.innerHTML = ''; // Limpiar la lista
    usuarios.forEach(alias => {
      const li = document.createElement('li');
      li.textContent = "  🟢  " + alias;
      listaUsuarios.appendChild(li);
    });
  });

  // Funcionalidad Escribiendo...
  const inputMensaje = document.getElementById('inputMensaje');
  // Emitir "escribiendo" al servidor cuando el usuario empieza a tipear
  inputMensaje.addEventListener('input', () => {
    socket.emit('escribiendo', { room, alias });
  });

  const escribiendoDiv = document.getElementById('escribiendo');

  socket.on('usuarioEscribiendo', (data) => {
    if (data.alias !== alias) {
      escribiendoDiv.textContent = `✏️ ${data.alias} está escribiendo...`;
      clearTimeout(window._escribiendoTimer);
      window._escribiendoTimer = setTimeout(() => {
        escribiendoDiv.textContent = '';
      }, 2000);
    }
  });
});
