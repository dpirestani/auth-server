const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);
// Node-Record-lpcm16
const recorder = require('node-record-lpcm16');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

function speechFunction() {
    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';
    const command_and_search = 'command_and_search';
    const keywords = ['turn on', 'turn off', 'turn it on', 'turn it off'];

    const request = {
        config: {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
            model: command_and_search,
            speech_contexts: keywords
        },
        singleUtterance: true,
        interimResults: false // If you want interim results, set this to true
    };


    // Creates a client
    const client = new speech.SpeechClient();

    // Create a recognize stream
    const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data =>
        // process.stdout.write(
        console.log(    
        data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`
        )
    );

    // Start recording and send the microphone input to the Speech API
    recorder
    .record({
        sampleRateHertz: sampleRateHertz,
        threshold: 0, //silence threshold
        recordProgram: 'rec', // Try also "arecord" or "sox"
        silence: '5.0', //seconds of silence before ending
        endOnSilence: true,
        thresholdEnd: 0.5
    })
    .stream()
    .on('error', console.error)
    .pipe(recognizeStream);

    console.log('Listening, press Ctrl+C to stop.');
    // [END micStreamRecognize]
}


app.use('/api/speech-to-text/',function(req, res){
  speechFunction(function(err, result){
      if (err) {
          console.log('Error retrieving transcription: ', err);
          res.status(500).send('Error 500');
          return;
      }
      res.send(result);
  })
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
