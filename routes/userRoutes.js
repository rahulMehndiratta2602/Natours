const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')
const router = express.Router()


router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').patch(authController.resetPassword)

//Applicable to all the routes after this line
router.use(authController.protect)

router.route('/updateMe').patch(
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
)
router.route('/deleteMe').delete(userController.deleteMe)
router.route('/getMe').get(userController.getMe, userController.getUser)
router.route('/updatePassword').patch(authController.updateUserPassword)

router.use(authController.restrictTo('admin'))
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUserMiddleware, userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
