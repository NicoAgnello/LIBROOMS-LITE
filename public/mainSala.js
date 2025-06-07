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

// Funciones complementarias
const setLocaleStorage = (nombre, valor) => {
    localStorage.setItem(String(nombre), valor);
}
const getLocaleStorage = (nombre) => {
    return localStorage.getItem(nombre)
}