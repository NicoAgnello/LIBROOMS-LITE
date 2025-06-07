// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Evento de conexión con Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);
  
  //Recibir mensaje de usuario
socket.on('mensajeChat', (mensaje) => {
  console.log('Mensaje recibido:', mensaje);
  // reenviar el mensaje a todos los clientes conectados
  io.emit('mensajeChat', mensaje);
});




  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});




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

