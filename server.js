const mongoose = require('mongoose')
const dotenv = require('dotenv')
process.on('uncaughtException', err => {
  console.log("UnCaught Exception! 💥 Shutting Down......")
  console.log(`${err.name}::: ${err.message}`)
  process.exit(1)
})
dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!', ` Node Environment--->${process.env.NODE_ENV}`))
  .catch((err) => { console.log("DATABASE ERROR") })

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
process.on('unhandledRejection', err => {
  console.log("Unhandled Rejection! 💥 Shutting Down......")
  console.log(`${err.name}::: ${err.message}`)
  server.close(() => {
    process.exit(1)
  })
})
