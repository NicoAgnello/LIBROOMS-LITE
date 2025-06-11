const socket = io();

// Función para enviar mensaje
const enviarMensaje = () => {
  const inputMensaje = document.getElementById("inputMensaje")
  let mensajeValue = inputMensaje.value
  let alias = getLocaleStorage("alias")
  mensaje = {
    value: mensajeValue,
    alias: alias
  }
  if(mensaje.value != ""){
      socket.emit("mensajeChat", mensaje)
  }
  inputMensaje.value = ""
}

//funcion para recibir mensajes del servidor
const chatLog = document.getElementById('chat-log');
socket.on('mensajeChat', (mensaje) => {
  const li = document.createElement('li');
  li.textContent = mensaje.hora + " - " + mensaje.alias + ": " + mensaje.value;
  chatLog.appendChild(li);
});


// Funciones complementarias
const setLocaleStorage = (nombre, valor) => {
    localStorage.setItem(String(nombre), valor);
}
const getLocaleStorage = (nombre) => {
    return localStorage.getItem(nombre)
}