const Tour = require('./../models/tourModel');

// removed, used in code before MongoDB Mongoose code
// const tours = JSON.parse(
//   // eslint-disable-next-line no-undef
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.CheckID = (req, resp, next, val) => {
//   console.log(`Tour id is : ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return resp.status(404).json({
//       status: 'fail',
//       message: 'tour not found',
//     });
//   }
//   next();
// };

// tours handlers
exports.getAllTours = async (req, resp) => {
  try {
    //Build Query

    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    console.log(req.query, ' ', queryObj);

    const query = Tour.find(queryObj);
    //

    // const tours = await Tour.find();

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // Execute query
    const tours = await query;

    // Send Response
    resp.status(200).json({
      requestTime: req.requestTime,
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.getTourById = async (req, resp) => {
  // #region old create standin new id code prior to mongoose code and model

  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // #endregion

  try {
    const tour = await Tour.findById(req.params.id);

    resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.updateTour = async (req, resp) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.createTour = async (req, resp) => {
  // #region old createTour Logic pre Mongoose and Schema
  /*
  // console.log(req.body);
  //pseudo code to fake getting a new id for the elements in the tours file we are using
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   // eslint-disable-next-line no-undef
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     resp.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );
  */
  // #endregion

  try {
    const newTour = await Tour.create(req.body);

    resp.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    resp.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, resp) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    resp.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};
