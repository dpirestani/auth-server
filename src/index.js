const mongoose = require('mongoose');
const app = require('./app');
const socketServer = require("socket.io");


//const https = require('https');
const http = require('http');
const config = require('./config/config');
const logger = require('./config/logger');
const fs = require('fs');
const socket =  require('socket.io')


let server;
let io;


mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  server = http.createServer(app)
    .listen(config.port, () => {
        console.log('server running at ' + config.port)
    })

    io =socketServer(server);

    io.on('connection', function(socket) {
      console.log('A socket got connected');
    
        //Send a message after a timeout of 4seconds
        socket.on('clientEvent', function(data) {
          console.log(data);
          const transcribeData = 'data';
          socket.broadcast('transcribeData', {desc: data})
      });
    
      socket.on('disconnect', function () {
         console.log('A socket disconnected');
      });
    });
});





const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
