// http://127.0.0.1:9001
// http://localhost:9001

const fs = require('fs');
const path = require('path');
const url = require('url');
var httpServer = require('http');
var https = require('https');
const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
//
const express = require('express');
const app = express();
//
var config = require('./config.json');

//settings
app.set('port', process.env.PORT || 3000);

var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    requestCert: false,
    rejectUnauthorized: false
};


// start the server
/* const server = app.listen(app.get('port'), ()=> {
    console.log('server on port', app.get('port'))
}) */

var server = https.createServer(options, app).listen(3000, function(){
    console.log("server started at port 3000");
});


// static files
app.use(express.static(path.join(__dirname)));
console.log(path.join(__dirname ));

// Socket io
const SocketIO = require('socket.io');
const io = SocketIO(server); //Configuración del chat
//

/////////////////////////////////////////////////////

// --------------------------
// socket.io codes goes below

io.on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket, config);

    // ----------------------
    // below code is optional

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        socket.broadcast.emit(params.socketCustomEvent, message);
    });


    //////////////////////////


    socket.on('PC:Data', (data) => {
        //PARA SOCKET CON PC
        var io2 = require('socket.io-client')
        var socketPC = io2.connect('http://'+data.IP+':'+data.Port, {reconnect: true});
        // Add a connect listener
        socketPC.on('connect', function() { 
            console.log('Connected!');

          
                //console.log(data.canvasWidth, data.canvasHeight);
                //
                socketPC.emit('Canvas:Size', {        
                    canvasWidth: data.canvasWidth,        
                    canvasHeight: data.canvasHeight            
                });
            
               


    /* socket.on('Canvas:Size', (data) => {
        //console.log(data.canvasWidth, data.canvasHeight);
        //
        socketPC.emit('Canvas:Size', {        
            canvasWidth: data.canvasWidth,        
            canvasHeight: data.canvasHeight            
        });
    })  */

    socket.on('Canvas:Movement', (data) => {
        
        console.log(data.positionx,data.positiony);
        //
        socketPC.emit('Canvas:Movement', {        
            positionx: data.positionx,        
            positiony: data.positiony
        });
    })

    socket.on('Canvas:Click', (data) => {
                
        if(data.Type == "left")
        {
            if(data.Action == "up")
            {
                console.log(data.Type,data.Action);                
                //
                socketPC.emit('Canvas:Click', {        
                Type: "left",        
                Action: "up"
        });
                
            }
            else
            {
                console.log(data.Type,data.Action);
                //
                socketPC.emit('Canvas:Click', {        
                    Type: "left",        
                    Action: "down"
                }); 
            }            
        }
        else if(data.Type == "all")
        {
            console.log(data.Type,data.Action);
            //
            socketPC.emit('Canvas:Click', {        
                Type: "all",        
                Action: "up"
            }); 
        }  
    })   
});        
})





    
});

