/* eslint-disable no-undef */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tours = require('./../../models/tourModel');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

// console.log(`Connection string = ${process.env.DEV_DB_CONNETIONSTRING}`);
// console.log(`DB User = ${process.env.DEV_USER}`);
// console.log(`DB password = ${process.env.DEV_PASSWORD}`);

const db = process.env.DEV_DB_CONNETIONSTRING.replace(
  '<userid>',
  process.env.DEV_USER
).replace('<db_password>', process.env.DEV_PASSWORD);

console.log(`Complete Connection String = ${db}`);

mongoose
  .connect(db, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    // console.log(conn.connections);
    // console.log(`Db Connection: ${db} - succesful.`);
    console.log(`Db Connection ${conn.Connection.name} - succesful.`);
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//Import Tours data function
const importData = async () => {
  try {
    await Tours.create(tours);
    console.log(
      `Data Successfully imported to ${Tours.collection.collectionName}`
    );
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//Delete all Tours data (truncate Tours collection) fucntion
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(
      `All documents successfully deleted from ${Tours.collection.collectionName}`
    );
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
