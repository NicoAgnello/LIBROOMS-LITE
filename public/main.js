const socket = io();

socket.on('connect', () => {
  console.log('Cliente conectado con id:', socket.id);
});

// Función para enviar mensaje
const enviarMensaje = () => {
  const inputMensaje = document.getElementById("inputMensaje")
  let mensaje = inputMensaje.value
  socket.emit("mensajeChat", mensaje)
  inputMensaje.value = ""
}

//funcion para recibir mensajes del servidor
const chatLog = document.getElementById('chat-log');
socket.on('mensajeChat', (mensaje) => {
  const li = document.createElement('li');
  li.textContent = mensaje;
  chatLog.appendChild(li);
});


// Clase para manejar el modal reutilizable
class ModalManager {
  constructor() {
    this.modal = document.getElementById('modal');
    this.title = document.getElementById('modal-title');
    this.input = document.getElementById('modal-input');
    this.error = document.getElementById('modal-error');
    this.acceptBtn = document.getElementById('modal-accept');
    this.extraContent = document.getElementById('modal-extra');
    this.currentCallback = null;
    this.currentValidator = null;
    this.isMandatory = false;

    this.init();
  }

  init() {
    if (!this.acceptBtn) return;

    this.acceptBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAccept();
    });

    if (this.input) {
      this.input.addEventListener('input', () => {
        if (this.input.value.trim() !== '') {
          this.hideError();
        }
      });

      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAccept();
        }
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal && !this.isMandatory) {
          this.close();
        }
      });
    }
  }

  show(options) {
    const {
      title = 'Título',
      placeholder = '',
      errorMessage = 'Campo requerido',
      validator = (value) => value.trim() !== '',
      onAccept = () => {},
      isMandatory = false,
      extraHTML = '' // permite inyectar HTML
    } = options;

    this.isMandatory = isMandatory;
    this.title.textContent = title;
    this.input.placeholder = placeholder;
    this.error.textContent = errorMessage;
    this.currentValidator = validator;
    this.currentCallback = onAccept;

    this.input.value = '';
    this.hideError();
    this.modal.classList.remove('none');
    this.input.focus();

    // Contenido adicional (radios, contraseña, etc.)
    if (this.extraContent) {
      this.extraContent.innerHTML = extraHTML;
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('none');
    }
    this.currentCallback = null;
    this.currentValidator = null;
    this.isMandatory = false;
    if (this.extraContent) this.extraContent.innerHTML = '';
  }

  handleAccept() {
    const value = this.input.value.trim();
    const isValid = this.currentValidator ? this.currentValidator(value) : true;

    if (isValid) {
      if (this.currentCallback) {
        const extraData = this.getExtraData();
        this.currentCallback(value, extraData);
      }
      this.close();
    } else {
      this.showError();
    }
  }

  getExtraData() {
    const tipo = document.querySelector('input[name="tipo-sala"]:checked')?.value || 'publica';
    const pass = document.getElementById('input-password')?.value?.trim() || '';
    return { tipoSala: tipo, password: pass };
  }

  showError() {
    this.error.style.display = 'block';
  }

  hideError() {
    this.error.style.display = 'none';
  }
}

// Inicializar el modal manager
const modalManager = new ModalManager();

// Crear sala
const crearSala = () => {
  const containerButtons = document.querySelector(".buttons-container");

  modalManager.show({
    title: 'Crear Nueva Sala',
    placeholder: 'Ej: Sala de Amigos',
    errorMessage: 'Ingrese un nombre y/o contraseña válida',
    validator: () => {
      const nombreSala = document.getElementById('modal-input')?.value?.trim();
      const tipo = document.querySelector('input[name="tipo-sala"]:checked')?.value;
      const password = document.getElementById('input-password')?.value?.trim() || '';
      if (!nombreSala) return false;
      if (tipo === 'privada' && password === '') return false;
      return true;
    },
    extraHTML: `
      <div class="check-container" style="margin-top: 10px;">
        <label><input type="radio" name="tipo-sala" value="publica" checked /> Pública</label>
        <label style="margin-left: 10px;"><input type="radio" name="tipo-sala" value="privada" /> Privada</label>
      </div>
      <div id="password-container" style="margin-top: 10px; display: none;">
        <input type="password" id="input-password" placeholder="Contraseña" />
      </div>
    `,
    onAccept: (nombreSala, extra) => {
      const alias = getLocaleStorage('alias');
      const datosSala = {
        nombreSala,
        tipoSala: extra.tipoSala,
        contraseña: extra.password,
        alias
      };
      console.log('Enviando datos de sala:', datosSala);
      socket.emit('crear-sala', datosSala);

      containerButtons.style.display = 'none';
      document.querySelector('.saludo').textContent = `Sala "${nombreSala}" creada`;
    }
  });

  // 🚨 Importante: agregar listener DESPUÉS de que se inyecta el contenido extra
  setTimeout(() => {
    const radios = document.querySelectorAll('input[name="tipo-sala"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        const tipoSeleccionado = document.querySelector('input[name="tipo-sala"]:checked')?.value;
        const passContainer = document.getElementById('password-container');
        if (passContainer) {
          passContainer.style.display = tipoSeleccionado === 'privada' ? 'block' : 'none';
        }
      });
    });
  }, 50); // le damos un mini delay para asegurarnos que ya se haya renderizado
};


// Pedir alias si no está
window.addEventListener('DOMContentLoaded', () => {
  const bienvenido = document.querySelector('.saludo');
  const aliasGuardado = getLocaleStorage('alias');

  if (aliasGuardado) {
    bienvenido.textContent = `Bienvenido/a ${aliasGuardado}`;
    socket.emit('alias', aliasGuardado);
    modalManager.close();
  } else {
    setTimeout(() => {
      modalManager.show({
        title: 'Ingresá tu alias',
        placeholder: 'Ej: Nico1337',
        errorMessage: 'Ingrese un alias válido',
        validator: (value) => value.trim().length >= 2,
        onAccept: (alias) => {
          setLocaleStorage('alias', alias);
          socket.emit('alias', alias);
          bienvenido.textContent = `Bienvenido/a ${alias}`;
        },
        isMandatory: true
      });
    }, 100);
  }
});

const setLocaleStorage = (nombre, valor) => {
  localStorage.setItem(String(nombre), valor);
};

const getLocaleStorage = (nombre) => {
  return localStorage.getItem(nombre);
};
