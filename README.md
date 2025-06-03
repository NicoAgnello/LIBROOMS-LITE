Estructura basica del proyecto:

leibrooms-lite/
├── server/         → Código del servidor (Express + Socket.IO)
│   └── index.js
├── public/         → Archivos que ve el usuario (frontend)
│   ├── index.html
│   ├── style.css
│   └── main.js     → Lógica del cliente con JS + Socket.IO
├── package.json
└── README.md

Utilizamos express y socket.io
express: Framework web que simplifica el manejo de rutas y archivos.
socket.io: Librería para WebSockets, permite comunicación en tiempo real entre cliente y servidor.

