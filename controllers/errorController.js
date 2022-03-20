const AppError = require('../utils/appError')

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    res.status(err.statusCode).render('error', {
        title: "Something went wrong!",
        msg: err.message
    })
}
const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        } else {
            console.log("💥  Non Operational Error 💥 ", err)
            res.status(500).json({
                status: 'error',
                message: 'Something went very very wrong'
            })
        }
    }
    else {
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: "Something went wrong!",
                msg: err.message
            })
        }
        else {
            res.status(err.statusCode).render('error', {
                title: "Something went wrong!",
                msg: "Please try again later"
            })
        }
    }
}
const handleCastErrorDB = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 404)
}
const handleDuplicateFieldsDB = (err) => {
    let duplicateFieldName = Object.keys(err.keyValue)[0]
    let duplicateFieldValue = Object.values(err.keyValue)[0]
    return new AppError(`Duplicate Field value "${duplicateFieldValue}" for "${duplicateFieldName}".Please use another value.`, 404)
}
const handleValidationErrorDB = err => {
    return new AppError(err.message, 404)
}
const handleJWTverificationError = () => new AppError('Invalid token. Please login again!', 401)
const handleJWTExpirationError = () => new AppError('Token has expired! Please log in again', 401)
module.exports = (err, req, res, next) => {
    //console.log('Inside Error Controller', err)
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    }
    else {
        console.log(err.name)
        if (err.name === 'CastError') {
            err = handleCastErrorDB(err)
        }
        else if (err.code === 11000) {
            err = handleDuplicateFieldsDB(err)
        } else if (err.name === "ValidationError") {
            err = handleValidationErrorDB(err)
        }
        else if (err.name === "TokenExpiredError") {
            err = handleJWTExpirationError()
        }
        else if (err.name === "JsonWebTokenError") {
            err = handleJWTverificationError()
        }
        // //console.log(err)
        sendErrorProd(err, req, res)
    }

}