// main.js

//Conexión Socket.IO
const socket = io();
socket.on('connect', () => console.log('Cliente conectado con id:', socket.id));
// Redireccion a sala
socket.on('salaCreada', (respuesta) => {
  if (respuesta.exito) {
    const sala = respuesta.sala;
    sessionStorage.setItem("salaJoinData", JSON.stringify({
      nombreSala: sala.nombreSala,
      privada: sala.privada,
      contrasena: sala.contrasena || "",
      alias: sala.alias

    }))
    localStorage.setItem('salaActual', sala.nombreSala);
    window.location.href = 'salaGeneral.html';
    document.getElementById('sala-modal').classList.add('hidden');
  } else {
    const errN = document.getElementById('sala-error-nombre');
    errN.textContent = respuesta.error || 'Error al crear sala';
    errN.classList.remove('hidden');
  }
});
socket.on('unidoSala', (respuesta) => {
  if (respuesta.exito) {
    localStorage.setItem('salaActual', respuesta.sala);
    window.location.href = 'salaGeneral.html';
    document.getElementById('join-modal').classList.add('hidden');
  } else {
    const errN = document.getElementById('join-error-nombre');
    const errP = document.getElementById('join-error-pass');
    
    // Resetear ambos mensajes primero
    errN.classList.add('hidden');
    errP.classList.add('hidden');

    if (respuesta.error.includes('contrasena')) {
      errP.textContent = respuesta.error;
      errP.classList.remove('hidden');
    } else {
      errN.textContent = respuesta.error;
      errN.classList.remove('hidden');
    }
  }
});

// Helpers LocalStorage
const setLocaleStorage = (k, v) => localStorage.setItem(k, v);
const getLocaleStorage = k => localStorage.getItem(k);

// — Alias Modal —
function initAliasModal() {
  const modal = document.getElementById('alias-modal');
  const inp   = document.getElementById('alias-input');
  const err   = document.getElementById('alias-error');
  const btn   = document.getElementById('alias-accept');
  const saludo = document.querySelector('.saludo');

  const show = ()=>{ modal.classList.remove('hidden'); inp.value=''; err.classList.add('hidden'); inp.focus(); };
  const hide = ()=> modal.classList.add('hidden');
  const update = ()=>{
    const a = getLocaleStorage('alias');
    saludo.textContent = a ? `Bienvenido/a ${a}` : 'Bienvenido/a';
  };

  getLocaleStorage('alias') ? (hide(), update()) : show();

  const validar = ()=>{
    const v = inp.value.trim();
    if (!v) { err.classList.remove('hidden'); return; }
    setLocaleStorage('alias', v);
    hide(); update();
  };
  btn.addEventListener('click', validar);
  inp.addEventListener('keydown', e=> e.key==='Enter' && validar());
}

// — Crear Sala Modal —
function initSalaModal() {
  const modal = document.getElementById('sala-modal');
  const nombre = document.getElementById('sala-nombre');
  const radios = [...document.getElementsByName('sala-tipo')];
  const pass   = document.getElementById('sala-password');
  const errN   = document.getElementById('sala-error-nombre');
  const errP   = document.getElementById('sala-error-pass');
  const btnOk  = document.getElementById('sala-accept');
  const btnCancel = document.getElementById('sala-cancel');

  const show = ()=>{ modal.classList.remove('hidden'); nombre.focus(); };
  const hide = ()=>{
    modal.classList.add('hidden');
    nombre.value = '';
    pass.value   = '';
    errN.classList.add('hidden');
    errP.classList.add('hidden');
    radios[0].checked = true;
    pass.classList.add('hidden');
  };

  radios.forEach(r=>{
    r.addEventListener('change', ()=>{
      if (r.value==='privada' && r.checked) pass.classList.remove('hidden');
      else pass.classList.add('hidden');
      errP.classList.add('hidden');
    });
  });

  const crear = ()=> {
    let ok = true;
    if (!nombre.value.trim()) { errN.classList.remove('hidden'); ok = false; }
    else errN.classList.add('hidden');
    const tipo = radios.find(r => r.checked).value;
    if (tipo === 'privada' && !pass.value.trim()) {
      errP.classList.remove('hidden'); ok = false;
    } else errP.classList.add('hidden');
    if (!ok) return;

    const a = getLocaleStorage('alias') || 'Anónimo';
    const sala = {
      nombreSala: nombre.value.trim(),
      privada: tipo === 'privada',
      ...(tipo === 'privada' && { contrasena: pass.value.trim() }),
      alias: a
    };

    socket.emit('crearSala', sala);
  };
  document.getElementById('crear-sala')
    .addEventListener('click', e=>{ e.preventDefault(); show(); });
  btnOk.addEventListener('click', crear);
  btnCancel.addEventListener('click', hide);
}

// — Unirse Sala Modal —
function initJoinModal() {
  const modal = document.getElementById('join-modal');
  const nombre = document.getElementById('join-nombre');
  const radios = [...document.getElementsByName('join-tipo')];
  const pass   = document.getElementById('join-password');
  const errN   = document.getElementById('join-error-nombre');
  const errP   = document.getElementById('join-error-pass');
  const btnOk  = document.getElementById('join-accept');
  const btnCancel = document.getElementById('join-cancel');

  const show = ()=>{ modal.classList.remove('hidden'); nombre.focus(); };
  const hide = ()=>{
    modal.classList.add('hidden');
    nombre.value = '';
    pass.value   = '';
    errN.classList.add('hidden');
    errP.classList.add('hidden');
    radios[0].checked = true;
    pass.classList.add('hidden');
  };

  radios.forEach(r=>{
    r.addEventListener('change', ()=>{
      if (r.value==='privada' && r.checked) pass.classList.remove('hidden');
      else pass.classList.add('hidden');
      errP.classList.add('hidden');
    });
  });

  const unir = ()=> {
    debugger
    let ok = true;
    if (!nombre.value.trim()) { errN.classList.remove('hidden'); ok = false; }
    else errN.classList.add('hidden');
    const tipo = radios.find(r => r.checked).value;

    if (tipo === 'privada' && !pass.value.trim()) {
        errP.classList.remove('hidden'); ok = false;
      } else errP.classList.add('hidden');
    if (!ok) return;

    const sala = {
      nombreSala: nombre.value.trim(),
      privada: tipo === 'privada',
      ...(tipo === 'privada' && { contrasena: pass.value.trim() }),
      alias: getLocaleStorage('alias') || 'Anónimo'
    };

    sessionStorage.setItem("salaJoin", JSON.stringify(sala))

    socket.emit('unirseSala', sala); // solo esto
    localStorage.setItem('salaActual', sala.nombreSala)
    console.log(sala)
    window.location.href="salaGenera-l.html"
  };


  document.getElementById('unirse-sala')
    .addEventListener('click', e=>{ e.preventDefault(); show(); });
  btnOk.addEventListener('click', unir);
  btnCancel.addEventListener('click', hide);
}

// — Función genérica (para crearSala) —
function unirseSala(sala) {
  localStorage.setItem('salaActual', sala.nombreSala);
  window.location.href = 'salaGeneral.html';
}

// — Init al cargar página —
window.addEventListener('load', () => {
  initAliasModal();
  initSalaModal();
  initJoinModal();

  // Botón Unirse Sala General
  document.getElementById('unirse-sala-gral')
    .addEventListener('click', e => {
      e.preventDefault();
      socket.emit('unirseSala', {
        nombreSala: 'General',
        privada: false,
        alias: getLocaleStorage('alias') || 'Anónimo'
      });
      localStorage.setItem('salaActual', 'general');
    });
});
