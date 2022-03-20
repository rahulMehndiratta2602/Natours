const express = require('express')
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')




const router = express.Router()
router.get('/me', authController.protect, viewController.getMe)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/my-tours', authController.protect, viewController.getMyTours)
module.exports = router

// const CSP = 'Content-Security-Policy'
// const POLICY = "default-src 'self' https://*.mapbox.com ;" +
//     "base-uri 'self';block-all-mixed-content;" +
//     "font-src 'self' https: data:;" +
//     "frame-ancestors 'self';" +
//     "img-src http://localhost:8000 'self' blob: data:;" +
//     "object-src 'none';" +
//     "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
//     "script-src-attr 'none';" +
//     "style-src 'self' https: 'unsafe-inline';" +
//     'upgrade-insecure-requests;'
