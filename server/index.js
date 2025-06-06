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

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});



// Levantar el servidor
const PORT = 3000;
const os = require('os');

// Función para obtener la IP local
function getLocalIPv4() {
  const interfaces = require('os').networkInterfaces();
  for (const ifaceList of Object.values(interfaces)) {
    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIPv4();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://${ip}:${PORT}`);
});

