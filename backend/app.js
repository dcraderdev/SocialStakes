// app.js

const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();
const { ValidationError } = require('sequelize');
const routes = require('./routes');
const socketHandlers = require("./sockets");


// socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: isProduction ? process.env.REACT_APP_BACKEND_PROD_URL : 'http://localhost:3000',
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

socketHandlers(io)


app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin',
  })
);

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && 'Lax',
      httpOnly: true,
    },
  })
);




app.use(routes);

app.get('/', async (req, res, next) => {
  res.status(200).send(`Welcome to Dcraderdev's Social Stakes!`);
});





// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = 'Validation error';
  }
  next(err);
});

app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = 'Resource Not Found';
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

// all other errors
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  return res.json({
    message: err.message,
    statusCode: err.statusCode || 400,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});



// socket.io
module.exports = server;

// module.exports = app;
