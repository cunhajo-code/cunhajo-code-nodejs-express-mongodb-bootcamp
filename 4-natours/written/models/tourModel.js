const slugify = require('slugify');
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
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
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a difficulty summary description.'],
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

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// #region Query middleware

// tourSchema.pre('find', function (next) {
//using a regular expression in the hook allows for triggering this query pre middleware
//  for all commands that start with 'find' [find, findOne findMany etc.]
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }), next();
  this.queryStart = Date.now();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query ran ${Date.now() - this.queryStart} millis`);
  console.log(docs);
  next();
});
// #endregion

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

// #endregion
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
