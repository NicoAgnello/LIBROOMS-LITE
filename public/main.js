// main.js

//Conexión Socket.IO
//const socket = io();
//socket.on('connect', () => console.log('Cliente conectado con id:', socket.id));

// Helpers LocalStorage
const setLocaleStorage = (key, val) => localStorage.setItem(key, val);
const getLocaleStorage = key => localStorage.getItem(key);

// Inicializa modal de alias y actualiza saludo
function initAliasModal() {
  const modal = document.getElementById('alias-modal');
  const input = document.getElementById('alias-input');
  const error = document.getElementById('alias-error');
  const btn = document.getElementById('alias-accept');
  const saludo = document.querySelector('.saludo');

  const show = () => {
    modal.classList.remove('hidden');
    input.value = '';
    error.classList.add('hidden');
    input.focus();
  };
  const hide = () => modal.classList.add('hidden');

  const updateGreeting = () => {
    const alias = getLocaleStorage('alias');
    saludo.textContent = alias ? `Bienvenido/a ${alias}` : 'Bienvenido/a';
  };

  if (getLocaleStorage('alias')) {
    hide();
    updateGreeting();
  } else {
    show();
  }

  const validate = () => {
    const val = input.value.trim();
    if (!val) {
      error.classList.remove('hidden');
      return;
    }
    setLocaleStorage('alias', val);
    hide();
    updateGreeting();
  };

  btn.addEventListener('click', validate);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') validate();
  });
}

// Inicializa modal de creación de sala
function initSalaModal() {
  const modal      = document.getElementById('sala-modal');
  const nombreIn   = document.getElementById('sala-nombre');
  const radios     = [...document.getElementsByName('sala-tipo')];
  const passIn     = document.getElementById('sala-password');
  const errName    = document.getElementById('sala-error-nombre');
  const errPass    = document.getElementById('sala-error-pass');
  const btnOk      = document.getElementById('sala-accept');
  const btnCancel  = document.getElementById('sala-cancel');

  const show = () => { modal.classList.remove('hidden'); nombreIn.focus(); };
  const hide = () => {
    modal.classList.add('hidden');
    nombreIn.value = '';
    passIn.value = '';
    errName.classList.add('hidden');
    errPass.classList.add('hidden');
    radios[0].checked = true;
    passIn.classList.add('hidden');
  };

  radios.forEach(r => r.addEventListener('change', () => {
    if (r.value === 'privada' && r.checked) passIn.classList.remove('hidden');
    else passIn.classList.add('hidden');
    errPass.classList.add('hidden');
  }));

  const crearSala = () => {
    const name = nombreIn.value.trim();
    const tipo = radios.find(r => r.checked).value;
    const pass = passIn.value.trim();
    let valid = true;

    if (!name) {
      errName.classList.remove('hidden');
      valid = false;
    } else {
      errName.classList.add('hidden');
    }

    if (tipo === 'privada' && !pass) {
      errPass.classList.remove('hidden');
      valid = false;
    } else {
      errPass.classList.add('hidden');
    }

    if (!valid) return;

    const alias = getLocaleStorage('alias') || 'Anónimo';
    const privada = tipo === 'privada';
    const salaObj = {
      nombreSala: name,
      privada,
      contraseña: privada ? pass : '',
      alias
    };

    socket.emit('crearSala', salaObj);
    console.log('Sala creada:', salaObj);

    unirseSala(name, privada, pass);
    hide();
  };

  document.getElementById('crear-sala')
    .addEventListener('click', e => { e.preventDefault(); show(); });

  btnOk.addEventListener('click', crearSala);
  [nombreIn, passIn].forEach(el =>
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') crearSala();
    })
  );
  btnCancel.addEventListener('click', hide);
}

// Función genérica para unirse a una sala
function unirseSala(nombre = 'general', privada = false, contraseña = '') {
  const alias = getLocaleStorage('alias') || 'Anónimo';
  const salaObj = {
    nombreSala: nombre,
    privada,
    contraseña: privada ? contraseña : '',
    alias
  };

  socket.emit('unirseSala', salaObj);
  console.log('Unido a sala:', salaObj);

  localStorage.setItem('salaActual', nombre);
  window.location.href = 'salaGeneral.html';
}

// Iniciar todo
window.addEventListener('load', () => {
  initAliasModal();
  initSalaModal();

  document.getElementById('unirse-sala-gral')
    .addEventListener('click', e => {
      e.preventDefault();
      unirseSala();
    });

  document.getElementById('unirse-sala-priv')
    .addEventListener('click', e => {
      e.preventDefault();
      const nombre = prompt('¿Cómo se llama la sala privada?').trim();
      const pass = prompt('Contraseña:').trim();
      if (nombre && pass) unirseSala(nombre, true, pass);
      else alert('Debes ingresar nombre y contraseña válidos.');
    });
});
