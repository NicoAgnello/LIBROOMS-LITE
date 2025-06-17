// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const salas = new Map(); // Lista de salas creadas
const userInfo = new Map(); // socket.id => { alias, sala } usuarios conectados por sala

crearSalaGeneral();

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// CONEXION CON WEBSOCKET
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);
/*
  mensaje = {
      value: mensajeValue,
      alias: alias
      room: nombreSala
      hora: HH:MM
  }
*/
  
    /*
    //RECIBIR MENSAJE USUARIO PRIMERA VERSION
socket.on('mensajeChat', (mensaje) => {
  let hora = getHora(); // Obtener hora actual
  mensaje.hora = hora;  // Agregar hora al objeto mensaje
  console.log('Mensaje recibido:', mensaje);

  //REENVIAR MENSAJE A SALA GENERAL
    io.emit('mensajeChat', mensaje);
});*/

//------------------------------------
socket.on('mensajeChat', (mensaje) => {
  console.log(mensaje)
  let hora = getHora(); // Obtener hora actual
  mensaje.hora = hora;  // Agregar hora al objeto mensaje
  console.log(`Mensaje recibido (${mensaje.value}) para sala (${mensaje.room}) de ${mensaje.alias}`);

  //REENVIAR MENSAJE A SALA GENERAL
    io.to(mensaje.room).emit('mensajeChat', mensaje);
});
//-------------------------------------

  //CREAR UNA SALA
  socket.on('crearSala', (sala) => {
/* Sala{
    nombreSala: "Ejemplo",
    privada: "tipo",
    contraseña: "Passwrd",
    alias: "Fulanito", //Creador de la sala
    hora: "HH:MM",  //Hora de creacion de la sala
    usuariosConectados: [user1, user2,...]

if (!salas.has(sala.nombreSala)) {
  let hora = getHora(); // Obtener hora actual
  sala.hora = hora;

  // Asegurar que tenga usuariosConectados inicializado
  sala.usuariosConectados = [];

  salas.set(sala.nombreSala, sala);


}*/
    if (!salas.has(sala.nombreSala)) {
      console.log(sala);
      let tipoSala = ""
      let hora = getHora(); // Obtener hora actual
      sala.hora = hora; 
      sala.usuariosConectados = [];
      salas.set(sala.nombreSala, sala);
      if (sala.privada === true ){
        tiposala = "privada"
      }else{
        tiposala = "publica"
      }
      console.log(`🟢Sala creada: ${sala.nombreSala} tipo: ${tiposala}, creada por ${sala.alias}`);
      socket.join(sala.nombreSala);
      registrarUsuarioEnSala(socket, sala.nombreSala, sala.alias); // Agregar usuario creador
      socket.emit('salaCreada', { exito: true, sala });
      console.log(salas)
      console.log('salaCreada', { exito: true, sala });
    } else {
      socket.emit('salaCreada', { exito: false, error: `${sala.nombreSala} ya existe` });
      console.log('Erorr al crear la sala, sala existente')
      console.log('salaCreada', { exito: false, sala });
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
    usuariosConectados: "array con usuarios"
}*/

  const nombreSala = sala.nombreSala;
  if (salas.has(nombreSala)) {
    const salaCreada = salas.get(nombreSala);

    // Comparamos la contraseña ingresada con la almacenada
    if(sala.tipo === true){ //validar si es privada o publica
      if (sala.contraseña === salaCreada.contraseña) {
        socket.join(nombreSala);
        registrarUsuarioEnSala(socket, nombreSala, sala.alias);

        socket.emit('unidoSala', { exito: true, sala: nombreSala });
        console.log(`${sala.alias} se unió a la sala: ${nombreSala}`);

      } else {
      // Si la contraseña es incorrecta, enviamos un error al cliente
        socket.emit('unidoSala', { exito: false, error: 'La contraseña es incorrecta.' });
        console.log(`Error: intento de ingresar con contraseña incorrecta a ${nombreSala}`);
      }
    }
    else { //sala publica
            socket.join(nombreSala);
      socket.emit('unidoSala', { exito: true, sala: nombreSala });
      console.log(`${sala.alias} se unió a la sala: ${nombreSala}`);
      registrarUsuarioEnSala(socket, nombreSala, sala.alias);
    }
  } else {
    socket.emit('unidoSala', { exito: false, error: `La sala "${nombreSala}" no existe.` });
    console.log(`Error: intento de unirse a sala inexistente: (${nombreSala})`);
  }
});

//DESCONECTARSE DE SALA
socket.on('disconnect', () => {
  console.log('Usuario desconectado:', socket.id);

  const info = userInfo.get(socket.id);
  if (info) {
    const { alias, sala } = info;
    if (salas.has(sala)) {
      const salaObj = salas.get(sala);

      // Eliminar al usuario de la lista
      salaObj.usuariosConectados = salaObj.usuariosConectados.filter(user => user !== alias);
      console.log(`Usuario ${alias} eliminado de la sala ${sala}`);

      // 🔥 Emitir actualización de usuarios conectados
      io.to(sala).emit('actualizarUsuarios', salaObj.usuariosConectados);
    }
    userInfo.delete(socket.id);
  }
});


/*
//DESCONECCION DEL CLIENTE
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
  */
});

//Obtener hora
function getHora(){
  const ahora = new Date()
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  const horaActual = `${horas}:${minutos}`;
  return horaActual
}

//Agregar usuario a la lista de usuariosconectados por sala
function registrarUsuarioEnSala(socket, salaNombre, alias) {
  const sala = salas.get(salaNombre);
  if (!sala) return;

  // Asocia socket.id con alias y sala
  userInfo.set(socket.id, { alias, sala: salaNombre });

  // Evita duplicados en la lista de conectados
  if (!sala.usuariosConectados.includes(alias)) {
    sala.usuariosConectados.push(alias);
  }
   // Emitir la lista actualizada de usuarios a todos en la sala
  io.to(salaNombre).emit('actualizarUsuarios', sala.usuariosConectados);
}
// Levantar el servidor
const PORT = 3000;
const os = require('os');

//CREAR SALA GENERAL
function crearSalaGeneral() {
  const hora = getHora();
  const salaGeneral = {
    nombreSala: "General",
    privada: false,
    contraseña: "",  // No se necesita para pública
    alias: "Sistema", // Quien la crea (podés usar otro identificador si querés)
    hora: hora,
    usuariosConectados: []
  };

  salas.set(salaGeneral.nombreSala, salaGeneral);
  console.log(`🟢 Sala 'General' creada automáticamente a las ${hora}`);
}

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

