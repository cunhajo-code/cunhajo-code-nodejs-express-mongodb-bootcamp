/* eslint-disable no-undef */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(`Connection string = ${process.env.DEV_DB_CONNETIONSTRING}`);
// console.log(`DB User = ${process.env.DEV_USER}`);
// console.log(`DB password = ${process.env.DEV_PASSWORD}`);

const db = process.env.DEV_DB_CONNETIONSTRING.replace(
  '<userid>',
  process.env.DEV_USER
).replace('<db_password>', process.env.DEV_PASSWORD);

console.log(`Complete Connection String = ${db}`);

// mongoose
//   .connect(db, {
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
mongoose.connect(db).then((conn) => {
  // console.log(conn.connections);
  // console.log(`Db Connection: ${db} - succesful.`);
  console.log(`Db Connection ${conn.Connection.name} - succesful.`);
});

// console.log(process.env);

const port = 3000;
app.listen(port, () => {
  console.log('Natours app running on port 3000');
});
