$(function(){

    const socket = io();
    let myNick = '';

    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');

    const $users = $('#usernames');

    // REGISTRO DE USUARIO
    $nickForm.submit(e => {
        e.preventDefault();

        myNick = $nickname.val().trim();

        socket.emit('Nuevo usuario', myNick, data => { // 🔥 corregido nombre
            if (data){
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('<div class="alert alert-danger">Ese usuario ya existe!</div>');
            }
            $nickname.val('');
        });
    });

    //  ENVIAR MENSAJE
    $messageForm.submit(e => {
        e.preventDefault();

        socket.emit('Enviar mensaje', $messageBox.val(), data =>{
            if (data){
                $chat.append(`<p class="error">${data}</p>`);
            }
        });

        $messageBox.val('');
    });

    //  MENSAJE NORMAL
    socket.on('Nuevo mensaje', data => {
        if(data.nick === myNick){
            $chat.append(`<div style="color:blue"><b>${data.nick}:</b> ${data.msg}</div>`);
        } else {
            $chat.append(`<div><b>${data.nick}:</b> ${data.msg}</div>`);
        }
    });

    //  MENSAJE PRIVADO
    socket.on('whisper', data => {

        if(data.type === 'out'){
        // mensaje privado que TÚ envías
            $chat.append(`
                <div style="text-align:right; color:blue;">
                    <b>Para ${data.nick} (privado):</b> ${data.msg}
                </div>
            `);
        } else {
        // mensaje privado que RECIBES
            $chat.append(`
                <div style="text-align:left; color:purple;">
                    <b>${data.nick} (privado):</b> ${data.msg}
                </div>
            `);
        }
    });
    //  LISTA DE USUARIOS
    socket.on('usernames', data => {
        let html = '';
        for (let i = 0; i < data.length; i++){
            html += `<p><i class="fas fa-user"></i> ${data[i]}</p>`;
        }
        $users.html(html);
    });

    socket.on('Cargando viejos mensajes', msgs =>{
        for(let i = 0; i<msgs.length; i++){
            displayMsg(msgs[i])
        }
    })
    function displayMsg(data){
        $chat.append(`<p class="whisper"><b>${data.nick}:</b>${data.msg}</p>`)
    }
});

