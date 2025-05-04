const fs = require('fs');

const tours = JSON.parse(
  // eslint-disable-next-line no-undef
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.CheckID = (req, resp, next, val) => {
  console.log(`Tour id is : ${val}`);
  if (req.params.id * 1 > tours.length) {
    return resp.status(404).json({
      status: 'fail',
      message: 'tour not found',
    });
  }
  next();
};

// tours handelers
exports.getAllTours = (req, resp) => {
  resp.status(200).json({
    requestTime: req.requestTime,
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};
exports.getTourById = (req, resp) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};
exports.createTour = (req, resp) => {
  // console.log(req.body);

  //pseudo code to fake getting a new id for the elements in the tours file we are using
  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    // eslint-disable-next-line no-undef
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
};
exports.updateTour = (req, resp) => {
  //actual file patch not implemented, just showing api verbs

  resp.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour would be here as an object',
    },
  });
};
exports.deleteTour = (req, resp) => {
  //actual delete not implemented, just showing api verbs

  resp.status(204).json({
    status: 'success',
    data: null,
  });
};
