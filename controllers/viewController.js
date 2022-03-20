const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Tour = require('./../models/tourModel')
const Booking = require('../models/bookingModel')

exports.baseController = catchAsync((req, res) => {

    res.render('base', {
        tour: "The Forest Hiker",
        user: "Rahul"
    })
}
)
exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find()
    res.status(200).render('overview', {
        title: 'Exciting tours for adventurous people',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const { slug } = req.params
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    if (!tour) {
        return next(new AppError('There is no tour with that name', 404))
    }
    res
        .status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: "Login"
    })
}
exports.getMe = (req, res) => {
    res.status(200).render('account', {
        title: "My Account"
    })
}
exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: { $in: tourIDs } })

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})