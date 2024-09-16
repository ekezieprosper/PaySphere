const express = require("express")
const cors = require("cors")

const userRouter = require("./routers/userRouter")
// const adminRouter = require("./routers/adminRouter")
const depositRouter = require("./routers/depositRouter")
const transferRouter = require("./routers/transferRouter")
const requestPaymentRouter = require("./routers/requestPaymentRouter")

require("./config/config")
require("dotenv").config()

const port = process.env.port
const app = express()

app.use(express.json())
app.use(cors())

// Routers
app.use(userRouter)
// app.use(adminRouter)
app.use(depositRouter)
app.use(transferRouter)
app.use(requestPaymentRouter)

app.get('/', (req, res) => {
  res.send('Streamlining payments and transactions for efficiency and ease.')
})

app.get('/get_secret_key', (req, res) => {
  const secretKey = process.env.KORA_SECRET_KEY
  if (secretKey) {
    res.send(`The secret key is: ${secretKey}`)
  } else {
    res.status(500).send('Secret key not found')
  }
})

app.listen(port, () => {
    console.log(`Server is active on port: ${port}`)
  })