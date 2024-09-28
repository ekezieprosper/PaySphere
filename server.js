const express = require("express")
const cors = require("cors")

const userRouter = require("./routers/userRouter")
const adminRouter = require("./routers/adminRouter")
const paymentRouter = require("./routers/paymentRouter")
const notificationRouter = require("./routers/notifications")
const allTransactions = require("./routers/allTransactions")
const frontStore = require("./routers/productRouter")
const cartRouter = require("./routers/cartRouter")

require("./config/config")
require("dotenv").config()

const port = process.env.port
const app = express()

app.use(express.json())
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
}))

app.use(express.urlencoded({ extended: true }))

// Routers
app.use(userRouter)
app.use(adminRouter)
app.use(paymentRouter)
app.use(notificationRouter)
app.use(allTransactions)
app.use(frontStore)
app.use(cartRouter)


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