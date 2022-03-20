const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handleFactory')

const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  }
  else cb(new AppError('Please upload only images', 404), false)
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})
exports.uploadUserPhoto = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()

  //Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)
  //Tour Images
  req.body.images = []
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const tourImage = `tour-${i + 1}-${req.params.id}-${Date.now()}.jpeg`
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${tourImage}`)
      req.body.images.push(tourImage)
    })
  )
  next()

}



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}


exports.getAllTours = getAll(Tour)
exports.getTour = getOne(Tour, { path: "reviews" })
exports.createTour = createOne(Tour)
exports.updateTour = updateOne(Tour)
exports.deleteTour = deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  })

})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1 // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ])

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  })
})

exports.getToursWithinRadius = catchAsync(async (req, res, next) => {
  // /tours-within/:distance/center/:latlng/unit/:unit
  // tours - within /: distance / center / -118.21289062500001, 40.38872787670187 / unit /: unit
  // { startLocation: { $geoWithin: { $centerSphere: [[-118.20148452457754, 34.01632529334484], 0.18786033524087822] } } }
  // { startLocation: { $geoWithin: { $centerSphere: [[-118.21289062500001, 40.38872787670187], 0.18080179985636602] } } }
  const { distance, latlng, unit } = req.params
  if (!distance || !latlng || !unit) {
    next(new AppError("Please provide the required fields", 404))
  }
  const [latitude, longitude] = latlng.split(",")
  const earthRadius = unit === 'mi' ? 3963.2 : 6378
  const radius = distance / earthRadius
  const tours = await Tour.find(
    {
      startLocation: {
        $geoWithin: {
          $centerSphere: [[longitude * 1, latitude * 1], radius]
        }
      }
    }
  )
  res.status(200).send({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  })
})

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  if (!latlng || !unit) {
    next(new AppError("Please provide the required fields", 404))
  }
  const [latitude, longitude] = latlng.split(",")
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
  const tours = await Tour.aggregate(
    [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude * 1, latitude * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      }, {
        $project: {
          name: 1,
          distance: 1
        }
      }
    ]
  )
  res.status(200).send({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  })
})