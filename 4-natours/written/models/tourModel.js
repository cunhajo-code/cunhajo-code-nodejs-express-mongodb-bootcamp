const slugify = require('slugify');
const mongoose = require('mongoose');

// #region Tour schema definition
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must not exceed 40 characters'],
      minlength: [10, 'Tour name must be at least 10 characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a max group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty rating.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be one of the following: easy, medium, diffcult',
      },
    },
    // Jonas Schemdtmann cluge alert!
    // ( one more poorly thought ouot feature which misleads
    //   those who never ACTUALLY DESIGNED solutions)
    // if a field is a ratings "average", why would you input it?
    // would be calculated using the actual array of rating.
    // rating would have to have this restriction and validation, not average
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour ratings average must be between 1 and 5'],
      max: [5, 'Tour ratings average must be between 1 and 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          console.log(this);
          if (val > this.price) return true;
          else return false;
        },
        message: 'Discount ({VALUE}) is greater than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// #endregion Tour schema definition

// #region Virtual Fields
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// #endregion Virtual Fields

// #region Document middleware

// pre document middleware
// runs before .save() and .create() but NOT on .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post docuemnt middleware
// tourSchema.post('save', function (doc, next){
//   console.log(doc);
//   next();
// });

// #endregion Document middleware

// #region Query middleware

// tourSchema.pre('find', function (next) {
//using a regular expression in the hook allows for triggering this query pre middleware
//  for all commands that start with 'find' [find, findOne findMany etc.]
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }), next();
  this.queryStart = Date.now();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query ran ${Date.now() - this.queryStart}`);
  console.log(docs);
  next();
});
// #endregion Query middleware

// #region Aggregation middleware

// works apparently by adding a new element to the aggregation pipeline, a new match element
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// #endregion Aggregation middlewar

// create and export model object
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
