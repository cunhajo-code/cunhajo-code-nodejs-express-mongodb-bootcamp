const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middleware
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

//middleware use fromExpress to tell app where to look for static files
// eslint-disable-next-line no-undef
app.use(express.static(`${__dirname}/public`));

app.use((req, resp, next) => {
  console.log('Hello from the midleware!');
  next();
});

app.use((req, resp, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// route Handlers - mount routers (separation of concerns)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
