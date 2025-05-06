/* eslint-disable no-unused-vars */
const Tour = require('./../models/tourModel');

// #region removed code, used before MongoDB Mongoose code
/*
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
*/
// #endregion

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    return this;
  }
  filter() {
    console.log(this.queryString);

    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];

    excludedFields.forEach((el) => delete queryObj[el]);

    const filterObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );

    // ⬇ Assign filterObj to both the query and a new property
    this.query = this.query.find(filterObj);
    this.filterObj = filterObj; // <-- this is what you'll use for countDocuments()

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //add sort criteria from url, replacing commas with spaces
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //set default sort of created
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  selection() {
    if (this.queryString.fields) {
      //include ONLY the selected field names
      //id is also sent
      const fields = this.queryString.fields.split(',').join(' ');
      //console.log(fields);
      this.query = this.query.select(fields);
    } else {
      //exclude the fields named prefixed with a minus
      // in this case, always exlude th MogoDB generated __v field
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination(rowCount) {
    // console.log(`pagination call results count= ${results}`);
    if (this.queryString.page || this.queryString.limit) {
      // counts the records AFTER the query is applied
      const numTours = rowCount;

      // page intialized to one if not specified with nullish coalescing operator
      const rawPage = this.queryString.page ?? 1;
      const page = rawPage * 1;
      const limit = this.queryString.limit * 1;
      const lastPage = Math.ceil(numTours / limit);
      let targetPage = 1;

      if (page > 1 && page <= lastPage) {
        targetPage = page;
      } else if (page > lastPage) {
        targetPage = lastPage;
      } else if (page < 1) {
        targetPage = 1;
      }

      const skip = (targetPage - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}

// tours handlers
exports.AliasTop5CheapTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name, price, ratingsAverage, summary, difficulty, duration';
  next();
};

exports.getAllTours = async (req, resp) => {
  try {
    // Execute query

    console.log('calling APIFeatures');

    const apiFeatures = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .selection();

    const rowCount = await Tour.countDocuments(apiFeatures.filterObj);
    console.log(rowCount);

    apiFeatures.pagination(rowCount);

    const tours = await apiFeatures.query;

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
   console.log(req.body);
  pseudo code to fake getting a new id for the elements in the tours file we are using
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
