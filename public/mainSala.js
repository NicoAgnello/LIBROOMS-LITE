const socket = io();

// Función para enviar mensaje
const enviarMensaje = () => {
  const inputMensaje = document.getElementById("inputMensaje")
  let mensaje = inputMensaje.value
  if(mensaje != ""){
      socket.emit("mensajeChat", mensaje)
  }
  inputMensaje.value = ""
}

//funcion para recibir mensajes del servidor
const chatLog = document.getElementById('chat-log');
socket.on('mensajeChat', (mensaje) => {
  const li = document.createElement('li');
  li.textContent = mensaje;
  chatLog.appendChild(li);
});


// Funciones complementarias
const setLocaleStorage = (nombre, valor) => {
    localStorage.setItem(String(nombre), valor);
}
const getLocaleStorage = (nombre) => {
    return localStorage.getItem(nombre)
}