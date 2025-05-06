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

// tours handlers
exports.getAllTours = async (req, resp) => {
  try {
    //Build Query

    // 1a. Filtering
    // console.log(req.query);

    const queryObj = { ...req.query };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);

    // 1b. Advanced filtering
    // #region Advance filtering Notes
    /*
       creating a queryStr string variable from query Object with JSON.stringiify
       and using .replace on that string inline with regular expression
       to add the $ reuired to convert operators into MongDB operators for each occurence
       and finally back to objects finally JOSN.Parse
       So assuming the following possibilities: gte, gt lte, lt
       The goal is to transform this from the url
       { difficulty: 'easy', duration: { gte: '5' } }
       To this for the query object
       { difficulty: 'easy', duration: {$gte: 5 }  }
    */
    // #endregion

    // the parse is accomplished by using a regular expresion
    // regular expresion captures and whole word instance of operators
    // and replaces with the saem but prefixed by $ for query object syntax
    let queryStr = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      )
    );

    // console.log(queryStr);

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

    // 4. Pagination features
    // #region Pagination Notes
    /*
       by now query looks something like query.[filters].sort().select()
       and on top of this is where we need to apply the values from the url to .skip().limit()
       compiled query now specifies all prior filtering, sorting and fields selection
        ( state of filtering sorting and field selection) as start for pagination
    */
    // #endregion

    if (req.query.page) {
      // #region Postman Pagination testing Logic notes
      /*
        1.  Establish limits based on number of records remaining after current query applied
            number of records in result set, last page given selected limit from query string.

        2.  Evaluate selected page from query string. 
            If it's less than zero ( normally return a bade request for an API call)
              set the targetPage to 1
            If it's greater than the calculated last page containing ANY rows
              set it to the calculated last page
            If its in the acceptable range of pages for this record count and limit
              set the traget page to the requested page

        3.  Append the page and limit to the query and apply, to retrun only the targeted rows.
      */
      // #endregion

      // counts the records AFTER the query is applied
      const numTours = await Tour.countDocuments(query);
      console.log('Tours in selection criteria: ', numTours);

      const page = req.query.page * 1;
      const limit = req.query.limit * 1;
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
      query = query.skip(skip).limit(limit);
    }

    // Execute query
    const tours = await query;

    // #region alternate code showing expanded query with where and equals clauses
    /*
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    */
    // #endregion

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
