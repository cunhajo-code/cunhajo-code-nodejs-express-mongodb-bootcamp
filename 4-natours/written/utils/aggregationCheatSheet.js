// aggregationReference.js
// Quick reference for Mongoose aggregation pipeline syntax

// Example aggregation pipeline
const stats = await Model.aggregate([
  // Stage 1: Filter documents (WHERE clause)
  { $match: { someField: { $gte: 10 } } },

  // Stage 2: Group documents (GROUP BY)
  {
    $group: {
      _id: '$groupingField',
      count: { $sum: 1 },
      avgValue: { $avg: '$numericField' },
      minValue: { $min: '$numericField' },
      maxValue: { $max: '$numericField' },
    },
  },

  // Stage 3: Sort results (ORDER BY)
  { $sort: { avgValue: -1 } },

  // Stage 4: Limit output (LIMIT)
  { $limit: 10 },

  // Stage 5: Project output (SELECT col AS alias)
  {
    $project: {
      groupingField: '$_id',
      avg: '$avgValue',
      _id: 0, // Exclude MongoDB default _id field
    },
  },
]);

// Optional stages
// Unwind an array field
// { $unwind: '$arrayField' }

// Lookup (JOIN equivalent)
/*
  {
    $lookup: {
      from: 'otherCollection', // collection to join
      localField: 'localKey',  // field from this collection
      foreignField: 'foreignKey', // field from other collection
      as: 'joinedData'         // alias for result
    }
  }
  */

// Add new fields to each document
// { $addFields: { newField: { $multiply: ['$a', '$b'] } } }

// Match after grouping (HAVING clause equivalent)
// { $match: { count: { $gt: 5 } } }

// Helpful tip: All fields referenced with $ (e.g., '$price')

// Use this as a live scratchpad or reference while building pipelines
// Swap Model with your actual Mongoose model, like Tour, User, etc.
