const socket = io();

// Enviar mensaje
const enviarMensaje = () => {
  const inputMensaje = document.getElementById("inputMensaje");
  const mensajeValue = inputMensaje.value.trim();
  const alias = getLocaleStorage("alias") || 'Anónimo';
  if (!mensajeValue) return;

  socket.emit("mensajeChat", { value: mensajeValue, alias });
  inputMensaje.value = "";
};

document.getElementById('botonEnviarMensaje').addEventListener('click', enviarMensaje);

// ⬇️ NUEVO: Enviar mensaje con Enter solo cuando estás en el input
document.getElementById('inputMensaje').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // evita que se agregue un salto de línea
    enviarMensaje();
  }
});

// Recibir y mostrar mensajes
const chatLog = document.getElementById('chat-log');
socket.on('mensajeChat', (mensaje) => {
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

// Helpers LocalStorage
const setLocaleStorage = (key, val) => localStorage.setItem(key, val);
const getLocaleStorage = key => localStorage.getItem(key);
