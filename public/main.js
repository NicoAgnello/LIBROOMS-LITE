// public/main.js
const socket = io();

socket.on('connect', () => {
  console.log('Cliente conectado con id:', socket.id);
});


const enviarMensaje = () => {
  const inputMensaje = document.getElementById("inputMensaje").value
  socket.emit("Mensaje chat", inputMensaje)
  inputMensaje = ""
}

const crearSala = () => {
  const containerButtons = document.querySelector(".buttons-container")
}

// Funcion Modal
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const btnAceptar = document.getElementById('aceptar-btn');
  const inputAlias = document.getElementById('alias-input');
  const errorMsg = document.getElementById('error-msg');
    
  const aliasGuardado = localStorage.getItem('alias');
  let bienvenido = document.querySelector('.saludo')

  if (aliasGuardado) {
    modal.style.display = 'none';
    bienvenido.textContent = `Bienvenido/a ${aliasGuardado}`;
  }

  btnAceptar.addEventListener('click', () => {
    const alias = inputAlias.value.trim();
    if (alias) {
      localStorage.setItem('alias', alias);
      modal.style.display = 'none';
      bienvenido.textContent = `Bienvenido/a ${alias}`;
    } else {
      errorMsg.style.display = 'block';
    }
  });

  inputAlias.addEventListener('input', () => {
    if (inputAlias.value.trim() !== '') {
      errorMsg.style.display = 'none';
    }
  });
  

});
