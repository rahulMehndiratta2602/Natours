const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')

const router = express.Router()



//POST /tour/hkfsh/reviews
//GET  /tour/hkfsh/reviews
//GET  /tour/hkfsh/reviews/4hfl2

router.use('/:tourId/reviews', reviewRouter)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
)

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithinRadius)

router.
  route('/center/:latlng/unit/:unit')
  .get(tourController.getDistances)
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  )

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadUserPhoto,
    tourController.resizeUserPhoto,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )




module.exports = router
