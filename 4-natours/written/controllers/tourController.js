/* eslint-disable no-unused-vars */
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.AliasTop5CheapTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name, price, ratingsAverage, summary, difficulty, duration';
  next();
};

exports.getTourStats = async (req, resp) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          //_id: '$difficulty',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgprice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    resp.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, resp) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          TourStarts: { $sum: 1 },
          Tours: { $push: '$name' },
        },
      },
      {
        $addFields: { Month: '$_id' },
      },
      {
        $sort: { _id: 1 }, // ascending month order
      },
      {
        $project: {
          Month: {
            $arrayElemAt: [
              [
                '',
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ],
              '$Month',
            ],
          },
          _id: 0,
          TourStarts: 1,
          Tours: 1,
        },
      },
    ]);

    resp.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    resp.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

// tours crud handlers
exports.getAllTours = async (req, resp) => {
  try {
    // Execute query

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
      message: error.message,
    });
  }
};

exports.getTourById = async (req, resp) => {
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
