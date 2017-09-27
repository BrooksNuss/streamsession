// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
var os = require('os');
var socketIO = require('socket.io');
var fs = require('fs');

var options = {
   key: fs.readFileSync('./key.pem'),
   cert: fs.readFileSync('./cert.pem')
}

// Get our API routes
// const api = require('./server/routes/api');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
// app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = 3000;//process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
// const server = http.createServer(app).listen(port);
const Sserver = https.createServer(options, app).listen(port);

/**
 * Listen on provided port, on all network interfaces.
 */
// server.listen(port, () => console.log(`API running on localhost:${port}`));
// Sserver.listen(3100, () => console.log("HTTPS server on 3100"));

var io = socketIO.listen(Sserver);
var clients = [];
//on new socket connection, watch for the following actions.
io.sockets.on('connection', function(socket) {
   // convenience function to log server messages on the client
  // function log() {
  //   var array = ['Message from server:'];
  //   array.push.apply(array, arguments);
  //   socket.emit('log', array);
  // }

  clients.push(socket);
  if(clients.length > 1) {
    socket.broadcast.emit('join', socket.id);
  }
  console.log("client connected: "+socket.id);
  console.log("current clients: "+clients.length);

  socket.on('offer', (message) => {
    console.log("received offer");
    socket.broadcast.to(message.socket).emit('offer', message);
  })

  socket.on('answer', (message) => {
    console.log("received answer");
    socket.broadcast.to(message.socket).emit('answer', message);
  })

  socket.on('candidate', (message) => {
    console.log("received candidate");
    socket.broadcast.to(message.socket).emit('candidate', message);
  })

  //on clients sending message, broadcast it.
  // socket.on('message', function(message) {
  //   log('Client said: ', message);
  //   // for a real app, would be room-only (not broadcast)
  //   socket.broadcast.emit('message', message);
  // });

  //on client creating/joining room, tell other sockets that the 
  //user has joined. If creating, tell the user that they created room.
  // socket.on('create or join', function(room) {
  //   log('Received request to create or join room ' + room);

  //   var numClients = Object.keys(io.sockets.sockets).length;
  //   log('Room ' + room + ' now has ' + numClients + ' client(s)');

  //   if (numClients === 1) {
  //     socket.join(room);
  //     log('Client ID ' + socket.id + ' created room ' + room);
  //     clients.push(socket.id);
  //     socket.emit('created', room, socket.id);

  //   } else if (numClients >1 && numClients <5 ) {
  //     log('Client ID ' + socket.id + ' joined room ' + room);
  //     io.sockets.in(room).emit('join', room);
  //     socket.join(room);
  //     clients.push(socket.id);
  //     socket.emit('joined', room, socket.id);
  //     io.sockets.in(room).emit('ready');
  //   } else { // max 5 clients
  //     socket.emit('full', room);
  //   }
  // });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('disconnect', function(){
    console.log('received dc');
  });
})