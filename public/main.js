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

// Clase para manejar el modal reutilizable
class ModalManager {
  constructor() {
    this.modal = document.getElementById('modal');
    this.title = document.getElementById('modal-title');
    this.input = document.getElementById('modal-input');
    this.error = document.getElementById('modal-error');
    this.acceptBtn = document.getElementById('modal-accept');
    this.currentCallback = null;
    this.currentValidator = null;
    
    // Debug: verificar que todos los elementos existan
    console.log('Modal elements:', {
      modal: this.modal,
      title: this.title,
      input: this.input,
      error: this.error,
      acceptBtn: this.acceptBtn
    });
    
    this.init();
  }

  init() {
    // Verificar que el botón existe antes de agregar el event listener
    if (!this.acceptBtn) {
      console.error('No se encontró el botón aceptar');
      return;
    }

    // Event listener para el botón aceptar
    this.acceptBtn.addEventListener('click', (e) => {
      console.log('Click en botón aceptar'); // Debug
      e.preventDefault();
      this.handleAccept();
    });

    // Event listener para input (quitar error al escribir)
    if (this.input) {
      this.input.addEventListener('input', () => {
        if (this.input.value.trim() !== '') {
          this.hideError();
        }
      });

      // Event listener para Enter en el input
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('Enter presionado'); // Debug
          e.preventDefault();
          this.handleAccept();
        }
      });
    }

    // Cerrar modal al hacer click fuera
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          console.log('Click fuera del modal'); // Debug
          this.close();
        }
      });
    }
  }

  show(options) {
    const {
      title = 'Título',
      placeholder = 'Ingresa el valor',
      errorMessage = 'Campo requerido',
      validator = (value) => value.trim() !== '',
      onAccept = () => {}
    } = options;

    this.title.textContent = title;
    this.input.placeholder = placeholder;
    this.error.textContent = errorMessage;
    this.currentValidator = validator;
    this.currentCallback = onAccept;

    this.input.value = '';
    this.hideError();
    this.modal.classList.remove('none');
    this.input.focus();
  }

  close() {
    console.log('Cerrando modal'); // Debug
    if (this.modal) {
      this.modal.classList.add('none');
      console.log('Clase "none" agregada'); // Debug
    }
    this.currentCallback = null;
    this.currentValidator = null;
  }

  handleAccept() {
    const value = this.input.value.trim();
    console.log('Valor ingresado:', value); // Debug
    console.log('Validator:', this.currentValidator); // Debug
    
    if (this.currentValidator && this.currentValidator(value)) {
      console.log('Validación exitosa'); // Debug
      if (this.currentCallback) {
        this.currentCallback(value);
      }
      this.close();
    } else {
      console.log('Validación fallida'); // Debug
      this.showError();
    }
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

// Función para crear sala
const crearSala = () => {
  console.log("Crear sala");
  const containerButtons = document.querySelector(".buttons-container");
  
  modalManager.show({
    title: 'Crear Nueva Sala',
    placeholder: 'Ej: Sala de Amigos',
    errorMessage: 'Ingrese un nombre para la sala',
    validator: (value) => value.length >= 3,
    onAccept: (nombreSala) => {
      console.log('Sala creada:', nombreSala);
      // Aquí puedes emitir el evento al servidor
      socket.emit('crear-sala', nombreSala);
      // Ocultar botones y mostrar mensaje de éxito
      containerButtons.style.display = 'none';
      document.querySelector('.saludo').textContent = `Sala "${nombreSala}" creada`;
    }
  });
};

// Función Modal - Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const bienvenido = document.querySelector('.saludo');
  const aliasGuardado = localStorage.getItem('alias');

  if (aliasGuardado) {
    bienvenido.textContent = `Bienvenido/a ${aliasGuardado}`;
    // Asegurar que el modal esté cerrado
    modalManager.close();
  } else {
    // Pequeño delay para asegurar que todo esté cargado
    setTimeout(() => {
      modalManager.show({
        title: 'Ingresá tu alias',
        placeholder: 'Ej: Nico1337',
        errorMessage: 'Ingrese un alias',
        validator: (value) => {
          const trimmedValue = value.trim();
          return trimmedValue.length >= 2;
        },
        onAccept: (alias) => {
          localStorage.setItem('alias', alias);
          bienvenido.textContent = `Bienvenido/a ${alias}`;
          console.log('Alias guardado:', alias);
        }
      });
    }, 100);
  }

  // Event listener para crear sala
  document.getElementById('crear-sala').addEventListener('click', crearSala);
});