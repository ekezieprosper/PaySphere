const express = require("express")
const cors = require("cors")

const userRouter = require("./routers/userRouter")
// const adminRouter = require("./routers/adminRouter")
const depositRouter = require("./routers/depositRouter")
const transferRouter = require("./routers/transferRouter")

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

app.get('/', (req, res) => {
  res.send('Start trading with VERTEX');
});

app.listen(port, () => {
    console.log(`Server is active on port: ${port}`)
  })