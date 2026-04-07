const http = require('http')
const path = require('path')
const express = require('express');
const socketio = require('socket.io')
const mongoose = require('mongoose')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.set ('port',process.env.PORT || 3000)
mongoose.connect('mongodb://127.0.0.1/chat-database')
    .then(db => console.log('base de datos conectada'))
    .catch(err => console.log('Error en BD:', err))
    
require('./sockets')(io)

app.use(express.static(path.join(__dirname, 'Public')));

server.listen(app.get('port'), () => {
    console.log("Servidor en el puerto",app.get('port'));
});