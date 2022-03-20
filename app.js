const express = require('express')
const morgan = require('morgan')
const globalErrorHandler = require('./controllers/errorController')
const AppError = require('./utils/appError')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')
const cookieParser = require('cookie-parser')

const cors = require('cors')
const app = express()
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

// 1) MIDDLEWARES

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.set('view engine', 'pug')
app.set('views', `${__dirname}/views`)
app.use(express.static(`${__dirname}/public`))
// app.use(cors())
//security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
}
))
//Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour'
})
app.use('/api', limiter)
//body-parser
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

//Data sanitization against NoSQL query injection
app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

//Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))



app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log("COOKIES:::", req.cookies)
  next()
})




// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)



app.all('*', (req, res, next) => {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server!`, 404)
  next(err)
})
app.use(globalErrorHandler)
module.exports = app
