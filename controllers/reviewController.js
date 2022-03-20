const Review = require("../models/reviewModel")
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handleFactory")

exports.addBodyToNestedRoutes = (req, res, next) => {
    //Allow nested routes this is only for create review
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id
    next()
}
exports.getAllReviews = getAll(Review)
exports.getReview = getOne(Review)
exports.createReview = createOne(Review)
exports.deleteReview = deleteOne(Review)
exports.updateReview = updateOne(Review)