const mongoose = require('mongoose');
const app = require('./app');


//const https = require('https');
const http = require('http');
const config = require('./config/config');
const logger = require('./config/logger');
const fs = require('fs');


const speech = require('@google-cloud/speech');
   const encoding = 'LINEAR16';
   const sampleRateHertz = 16000;
   const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };

  const request = {
    config,
    interimResults: false, //Get interim results from stream
  };


  const client = new speech.SpeechClient();
  const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data =>
    console.log(
      data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : '\n\nReached transcription time limit, press Ctrl+C\n'
    )
  );
  const recorder = require('node-record-lpcm16');
  recorder
  .record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0',
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);


let server;


mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  server = http.createServer(app)
    .listen(config.port, () => {
        console.log('server running at ' + config.port)
    })
});

let io = require('socket.io')(server);

io.on('connection', function(socket) {
  console.log('A socket got connected');

  //Send a message after a timeout of 4seconds
  socket.on('clientEvent', function(data) {
    console.log(data);
    const transcribeData = 'data';
    socket.emit('transcribeData', {desc: transcribeData})
 });

  socket.on('disconnect', function () {
     console.log('A socket disconnected');
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
