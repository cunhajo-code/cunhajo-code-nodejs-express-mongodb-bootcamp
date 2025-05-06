class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
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

module.exports = APIFeatures;
