// public/main.js
// const socket = io();

// console.log('Conectado con Socket.IO');
// console.log(socket)

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
    console.log('Alias ya guardado:', aliasGuardado);
    bienvenido.textContent = `Bienvenido ${aliasGuardado}`;
  }

  btnAceptar.addEventListener('click', () => {
    const alias = inputAlias.value.trim();
    if (alias) {
      localStorage.setItem('alias', alias);
      modal.style.display = 'none';
      console.log('Alias ingresado:', alias);
      bienvenido.textContent = `Bienvenido ${alias}`;
      
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
