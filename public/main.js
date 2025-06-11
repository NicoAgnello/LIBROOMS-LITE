// Conexión Socket.IO
const socket = io();
socket.on('connect', () => console.log('Cliente conectado con id:', socket.id));

// Helpers LocalStorage
const setLocaleStorage = (key, val) => {
  localStorage.setItem(key, val);
};
const getLocaleStorage = key => localStorage.getItem(key);

// Inicializa modal de alias y actualiza saludo
function initAliasModal() {
  const modal = document.getElementById('alias-modal');
  const input = document.getElementById('alias-input');
  const error = document.getElementById('alias-error');
  const btn = document.getElementById('alias-accept');
  const saludo = document.querySelector('.saludo');

  const show = () => { modal.classList.remove('hidden'); input.focus(); };
  const hide = () => modal.classList.add('hidden');

  const updateGreeting = () => {
    const alias = getLocaleStorage('alias');
    if (alias) saludo.textContent = `Bienvenido/a ${alias}`;
  };

  getLocaleStorage('alias') ? (hide(), updateGreeting()) : show();

  const validate = () => {
    const val = input.value.trim();
    if (!val) return error.classList.remove('hidden');
    setLocaleStorage('alias', val);
    hide();
    updateGreeting();
  };

  btn.addEventListener('click', validate);
  input.addEventListener('keydown', e => e.key === 'Enter' && validate());
}

// Inicializa modal de creación de sala
function initSalaModal() {
  const modal = document.getElementById('sala-modal');
  const nombreIn = document.getElementById('sala-nombre');
  const radios = [...document.getElementsByName('sala-tipo')];
  const passIn = document.getElementById('sala-password');
  const errName = document.getElementById('sala-error-nombre');
  const errPass = document.getElementById('sala-error-pass');
  const btnOk = document.getElementById('sala-accept');
  const btnCancel = document.getElementById('sala-cancel');

  const show = () => { modal.classList.remove('hidden'); nombreIn.focus(); };
  const hide = () => {
    modal.classList.add('hidden');
    nombreIn.value = passIn.value = '';
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
    if (!name) { errName.classList.remove('hidden'); valid = false; } else errName.classList.add('hidden');
    if (tipo === 'privada' && !pass) { errPass.classList.remove('hidden'); valid = false; } else errPass.classList.add('hidden');
    if (!valid) return;
    const alias = getLocaleStorage('alias') || 'Anónimo';
    const salaObj = { nombreSala: name, tipoSala: tipo, contraseña: tipo === 'privada' ? pass : '', alias };
    socket.emit('crearSala', salaObj);
    hide();
    console.log(salaObj);
  };
  document.getElementById('crear-sala').addEventListener('click', e => { e.preventDefault(); show(); });
  btnOk.addEventListener('click', crearSala);
  [nombreIn, passIn].forEach(el => el.addEventListener('keydown', e => e.key === 'Enter' && crearSala()));
  btnCancel.addEventListener('click', hide);
}

// Iniciar ambos modales
window.addEventListener('load', () => {
  initAliasModal();
  initSalaModal();
});