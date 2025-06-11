// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const salas = new Set(); // Lista de nombres de salas creadas

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Evento de conexión con Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);
/*
  mensaje = {
      value: mensajeValue,
      alias: alias
  }
*/
  
    
    //Recibir mensaje de usuario
socket.on('mensajeChat', (mensaje) => {
  let hora = getHora(); // Obtener hora actual
  mensaje.hora = hora;  // Agregar hora al objeto mensaje
  console.log('Mensaje recibido:', mensaje);
  // Reenviar el mensaje a todos los clientes conectados
  io.emit('mensajeChat', mensaje);
});

  //Crear una sala
  socket.on('crear-sala', (nombreSala) => {
    if (!salas.has(nombreSala)) {
      salas.add(nombreSala);
      console.log(`Sala creada: ${nombreSala}`);
      socket.join(nombreSala);
      socket.emit('salaCreada', { exito: true, nombreSala });
      console.log(salas)
    } else {
      socket.emit('salaCreada', { exito: false, error: 'Ya existe' });
      console.log('Erorr al crear la sala, sala existente')
    }
  });



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

