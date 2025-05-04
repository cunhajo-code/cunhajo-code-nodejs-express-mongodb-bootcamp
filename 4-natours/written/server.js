const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

// eslint-disable-next-line no-undef
console.log(process.env);

const port = 3000;
app.listen(port, () => {
  console.log('Natours app running on port 3000');
});
