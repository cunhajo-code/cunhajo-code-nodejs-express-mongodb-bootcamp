const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// param middleware for id param
// router.param('id', tourController.CheckID);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/top-5-cheap')
  .get(tourController.AliasTop5CheapTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
