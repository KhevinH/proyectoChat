const Chat = require('./Public/models/chat')

module.exports = function(io){

    let users = {}; // Diccionario de usuarios

    io.on('connection', async socket =>{
        console.log("Nuevo usuario conectado");

        let messages = await Chat.find({}).limit(10)
        socket.emit('Cargando viejos mensajes', messages)

        socket.on('Nuevo usuario', (data, cb) => {

            const username = data.trim();

            if (username.length === 0) {
                return cb(false);
            }

            if (username in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = username;
                users[socket.nickname] = socket; // Guardamos usuario
                updateNicknames();

                io.sockets.emit('Nuevo mensaje', {
                    msg: username + " se ha unido al chat",
                    nick: "Sistema"
                });
            }
        });

        socket.on("Enviar mensaje", (data, cb) => {

            let msg = data.trim();

            //  Mensaje privado
            if (msg.substr(0, 3) === '/w ') {

                msg = msg.substr(3);

                const index = msg.indexOf(' '); // espacio correcto

                if (index !== -1) {

                    const name = msg.substring(0, index); // usuario destino
                    const privateMsg = msg.substring(index + 1); // mensaje

                    if (name in users) {
                        users[name].emit('whisper', {
                            msg: privateMsg,
                            nick: socket.nickname,
                            type: 'in' // recibido
                        });
                        // Para el emisor
                        socket.emit('whisper', {
                            msg: privateMsg,
                            nick: name,
                            type: 'out' // enviado
                        });
                    } else {
                        cb('Error! Por favor entra un usuario válido');
                    }

                } else {
                    cb('Error! Escribe: /w usuario mensaje');
                }

            } else {
                //  Mensaje normal
                io.sockets.emit('Nuevo mensaje', {
                    msg: msg,
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', () => {     //Si no funciona = data -> ()
            if (!socket.nickname) return;

            delete users[socket.nickname]; // eliminamos del diccionario
            updateNicknames();
        });

        function updateNicknames(){
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
};