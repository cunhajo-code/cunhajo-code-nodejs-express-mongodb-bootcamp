const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

// app.get('/api/v1/', (req, resp) => {
//   resp.status(200).json({ message: 'Hello from the server!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint....');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// get all tours
app.get('/api/v1/tours', (req, resp) => {
  resp.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// get tour by id
app.get('/api/v1/tours/:id', (req, resp) => {
  // console.log(req.params);

  const id = req.params.id * 1;

  const tour = tours.find((el) => el.id === id);

  // pseudo code to provide not found logic for bad param
  if (!tour) {
    return resp.status(404).json({
      status: 'fail',
      message: 'tour not found',
    });
  }

  resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// post new tour
app.post('/api/v1/tours', (req, resp) => {
  // console.log(req.body);

  //pseudo code to fake getting a new id for the elements in the tours file we are using
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      resp.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

// patch tour by id
app.patch('/api/v1/tours/:id', (req, resp) => {
  //actual file patch not implemented, just showing api verbs
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  // pseudo code to provide not found logic for bad param
  if (!tour) {
    return resp.status(404).json({
      status: 'fail',
      message: 'tour not found',
    });
  }

  resp.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour would be here as an object',
    },
  });
});

// delete tour by id
app.delete('/api/v1/tours/:id', (req, resp) => {
  //actual delete not implemented, just showing api verbs
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  // pseudo code to provide not found logic for bad param
  if (!tour) {
    return resp.status(404).json({
      status: 'fail',
      message: 'tour not found',
    });
  }

  resp.status(204).json({
    status: 'success',
    data: null,
  });
});

const port = 3000;

app.listen(port, () => {
  console.log('Natours app running on port 3000');
});
