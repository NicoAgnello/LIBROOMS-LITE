// main.js

// 📡 Conexión inicial con el servidor usando Socket.IO
const socket = io();
socket.on('connect', () => console.log('Cliente conectado con id:', socket.id));


// ✅ Manejo de respuesta al crear sala desde el modal
socket.on('salaCreada', (respuesta) => {
  if (respuesta.exito) {
    const sala = respuesta.sala;

    // Guardamos info de la sala en sessionStorage para poder reenviar en salaGeneral.html
    sessionStorage.setItem("salaJoinData", JSON.stringify({
      nombreSala: sala.nombreSala,
      privada: sala.privada,
      contrasena: sala.contrasena || "",
      alias: sala.alias
    }));

    // Guardamos nombre de sala actual en localStorage (por compatibilidad)
    localStorage.setItem('salaActual', sala.nombreSala);

    // Redirigimos a la sala general
    window.location.href = 'salaGeneral.html';
    document.getElementById('sala-modal').classList.add('hidden');
  } else {
    const errN = document.getElementById('sala-error-nombre');
    errN.textContent = respuesta.error || 'Error al crear sala';
    errN.classList.remove('hidden');
  }
});


// ✅ Manejo de respuesta al unirse a una sala
socket.on('unidoSala', (respuesta) => {
  if (respuesta.exito) {
    const sala = respuesta.sala;

    // Guardamos los datos completos de la sala para reentrar desde salaGeneral.html
    sessionStorage.setItem("salaJoinData", JSON.stringify({
      nombreSala: sala.nombreSala,
      privada: sala.privada,
      contrasena: sala.contrasena || '',
      alias: getLocaleStorage('alias') || 'Anónimo'
    }));

    localStorage.setItem('salaActual', sala.nombreSala);
    window.location.href = 'salaGeneral.html';
    document.getElementById('join-modal').classList.add('hidden');
  } else {
    // Mostrar errores según tipo (nombre o contraseña)
    const errN = document.getElementById('join-error-nombre');
    const errP = document.getElementById('join-error-pass');

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


// 🔧 Helpers para usar localStorage de forma más limpia
const setLocaleStorage = (k, v) => localStorage.setItem(k, v);
const getLocaleStorage = k => localStorage.getItem(k);


// 🧑 Modal para ingresar alias al cargar la app
function initAliasModal() {
  const modal = document.getElementById('alias-modal');
  const inp   = document.getElementById('alias-input');
  const err   = document.getElementById('alias-error');
  const btn   = document.getElementById('alias-accept');
  const saludo = document.querySelector('.saludo');

  const show = ()=>{ modal.classList.remove('hidden'); inp.value=''; err.classList.add('hidden'); inp.focus(); };
  const hide = ()=> modal.classList.add('hidden');
  const update = ()=> {
    const a = getLocaleStorage('alias');
    saludo.textContent = a ? `Bienvenido/a ${a}` : 'Bienvenido/a';
  };

  getLocaleStorage('alias') ? (hide(), update()) : show();

  const validar = ()=> {
    const v = inp.value.trim();
    if (!v) { err.classList.remove('hidden'); return; }
    setLocaleStorage('alias', v);
    hide(); update();
  };

  btn.addEventListener('click', validar);
  inp.addEventListener('keydown', e=> e.key==='Enter' && validar());
}


// 🍔 Modal para crear una sala nueva (pública o privada)
function initSalaModal() {
  const modal = document.getElementById('sala-modal');
  const nombre = document.getElementById('sala-nombre');
  const radios = [...document.getElementsByName('sala-tipo')];
  const pass   = document.getElementById('sala-password');
  const errN   = document.getElementById('sala-error-nombre');
  const errP   = document.getElementById('sala-error-pass');
  const btnOk  = document.getElementById('sala-accept');
  const btnCancel = document.getElementById('sala-cancel');

  const show = () => {
  modal.classList.remove('hidden');
  nombre.focus();

  // Mostrar u ocultar campo contraseña según el radio seleccionado
  const tipoSeleccionado = radios.find(r => r.checked)?.value;
  if (tipoSeleccionado === 'privada') {
    pass.classList.remove('hidden');
  } else {
    pass.classList.add('hidden');
  }
};
  const hide = ()=> {
    modal.classList.add('hidden');
    nombre.value = '';
    pass.value = '';
    errN.classList.add('hidden');
    errP.classList.add('hidden');
    radios[0].checked = true;
    pass.classList.add('hidden');
  };

  // Mostrar u ocultar el input de contraseña según tipo
  radios.forEach(r => {
    r.addEventListener('change', ()=> {
      if (r.value === 'privada' && r.checked) pass.classList.remove('hidden');
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

  document.getElementById('crear-sala').addEventListener('click', e => { e.preventDefault(); show(); });
  btnOk.addEventListener('click', crear);
  btnCancel.addEventListener('click', hide);
}


// 🔑 Modal para unirse a una sala ya existente
function initJoinModal() {
  const modal = document.getElementById('join-modal');
  const nombre = document.getElementById('join-nombre');
  const radios = [...document.getElementsByName('join-tipo')];
  const pass   = document.getElementById('join-password');
  const errN   = document.getElementById('join-error-nombre');
  const errP   = document.getElementById('join-error-pass');
  const btnOk  = document.getElementById('join-accept');
  const btnCancel = document.getElementById('join-cancel');

  const show = () => {
  modal.classList.remove('hidden');
  nombre.focus();

  // Revisar si la opción seleccionada es privada
  const tipoSeleccionado = radios.find(r => r.checked)?.value;
  if (tipoSeleccionado === 'privada') {
    pass.classList.remove('hidden');
  } else {
    pass.classList.add('hidden');
  }
};
  const hide = ()=> {
    modal.classList.add('hidden');
    nombre.value = '';
    pass.value = '';
    errN.classList.add('hidden');
    errP.classList.add('hidden');
    radios[0].checked = true;
    pass.classList.add('hidden');
  };

  radios.forEach(r => {
    r.addEventListener('change', () => {
      if (r.value === 'privada' && r.checked) pass.classList.remove('hidden');
      else pass.classList.add('hidden');
      errP.classList.add('hidden');
    });
  });

  const unir = ()=> {
    let ok = true;
    if (!nombre.value.trim()) {
      errN.classList.remove('hidden');
      ok = false;
    } else {
      errN.classList.add('hidden');
    }

    const tipo = radios.find(r => r.checked).value;
    const esPrivada = tipo === 'privada';

    if (esPrivada && !pass.value.trim()) {
      errP.classList.remove('hidden');
      ok = false;
    } else {
      errP.classList.add('hidden');
    }

    if (!ok) return;

    const sala = {
      nombreSala: nombre.value.trim(),
      privada: esPrivada,
      ...(esPrivada && { contrasena: pass.value.trim() }),
      alias: getLocaleStorage('alias') || 'Anónimo'
    };

    socket.emit('unirseSala', sala);
  };

  document.getElementById('unirse-sala').addEventListener('click', e => { e.preventDefault(); show(); });
  btnOk.addEventListener('click', unir);
  btnCancel.addEventListener('click', hide);
}



// 🚀 Inicialización de la app al cargar la página
window.addEventListener('load', () => {
  initAliasModal();
  initSalaModal();
  initJoinModal();

  // Botón rápido para unirse directamente a la sala General
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
