// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const salas = new Map(); // Lista de salas creadas
const users = new Map() //Lista de alias de usuarios conectados

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// CONEXION CON WEBSOCKET
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);
/*
  mensaje = {
      value: mensajeValue,
      alias: alias
  }
*/
  
    
    //RECIBIR MENSAJE USUARIO
socket.on('mensajeChat', (mensaje) => {
  let hora = getHora(); // Obtener hora actual
  mensaje.hora = hora;  // Agregar hora al objeto mensaje
  console.log('Mensaje recibido:', mensaje);

  //REENVIAR MENSAJE A SALA GENERAL
    io.emit('mensajeChat', mensaje);
});

  //CREAR UNA SALA
  socket.on('crearSala', (sala) => {
/* Sala{
    nombreSala: "Ejemplo",
    tipoSala: "tipo",
    contraseña: "Passwrd",
    alias: "Fulanito",
    hora: "HH:MM"
}*/
    if (!salas.has(sala.nombreSala)) {
      let hora = getHora(); // Obtener hora actual
      sala.hora = hora; 
      salas.set(sala.nombreSala, sala);
      console.log(`Sala creada: ${sala.nombreSala}`);
      socket.join(sala.nombreSala);
      socket.emit('salaCreada', { exito: true, sala });
      console.log(salas)
    } else {
      socket.emit('salaCreada', { exito: false, error: `${sala.nombreSala} ya existe` });
      console.log('Erorr al crear la sala, sala existente')
    }
  });


//UNIRSE A UNA SALA
socket.on('unirseSala', (sala) => {

  /* Sala{
    nombreSala: "Ejemplo",
    tipoSala: "tipo",
    contraseña: "Passwrd",
    alias: "Fulanito",
    hora: "HH:MM"
}*/

  const nombreSala = sala.nombreSala;
  if (salas.has(nombreSala)) {
    const salaCreada = salas.get(nombreSala);

    // Comparamos la contraseña ingresada con la almacenada
    if (sala.contraseña === salaCreada.contraseña) {
      socket.join(nombreSala);

      socket.emit('unidoSala', { exito: true, sala: nombreSala });
      console.log(`Usuario se unió a la sala: ${nombreSala}`);
    } else {
      // Si la contraseña es incorrecta, enviamos un error al cliente
      socket.emit('unidoSala', { exito: false, error: 'La contraseña es incorrecta.' });
      console.log(`Error: intento de ingresar con contraseña incorrecta a ${nombreSala}`);
    }
  } else {
    socket.emit('unidoSala', { exito: false, error: `La sala "${nombreSala}" no existe.` });
    console.log(`Error: intento de unirse a sala inexistente (${nombreSala})`);
  }
});


//DESCONECCION DEL CLIENTE
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

//Obtener hora
function getHora(){
  const ahora = new Date()
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const horaActual = `${horas}:${minutos}`;
  return horaActual
}


// Levantar el servidor
const PORT = 3000;
const os = require('os');


function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  let fallback = null;

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Preferir interfaces de red Wi-Fi
        if (name.toLowerCase().includes('wi') || name.toLowerCase().includes('wlan') || name.toLowerCase().includes('en0')) {
          return iface.address;
        }

        // Guardar como alternativa en caso de no encontrar Wi-Fi
        if (!fallback) {
          fallback = iface.address;
        }
      }
    }
  }

  return fallback || 'localhost';
}

const ip = getLocalIPv4();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://${ip}:${PORT}`);
});

