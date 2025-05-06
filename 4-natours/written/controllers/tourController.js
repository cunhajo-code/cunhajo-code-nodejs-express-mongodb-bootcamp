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

    // 1a. Filtering
    // console.log(req.query);

    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);

    // 1b. Advanced filtering

    // creating a queryStr string variable from query Object with JSON.stringiify
    // and using .replace on that string inline with regular expression
    // to add the $ reuired to convert operators into MongDB operators for each occurence
    // and finally back to objects finally JOSN.Parse
    let queryStr = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );

    // console.log(queryStr);

    // { difficulty: 'easy', duration: {$gte: 5 }  }
    // { difficulty: 'easy', duration: { gte: '5' } }
    // gte, gt lte, lt

    let query = Tour.find(queryStr);

    // 2. Sorting
    if (req.query.sort) {
      //add sort criteria from url, replacing commas with spaces
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      //set default sort of created
      query = query.sort('-createdAt');
    }

    // 3. Field filtering
    if (req.query.fields) {
      //include ONLY the selected field names
      //id is also sent
      const fields = req.query.fields.split(',').join(' ');
      // console.log(fields);
      query = query.select(fields);
    } else {
      //exclude the fields named prefixed with a minus
      // in this case, always exlude th MogoDB generated __v field
      query = query.select('-__v');
    }
    // Execute query
    const tours = await query;

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

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
