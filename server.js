const express = require("express")
const cors = require("cors")

const userRouter = require("./routers/userRouter")
// const adminRouter = require("./routers/adminRouter")
const depositRouter = require("./routers/depositRouter")

require("./config/config")
require("dotenv").config()

const port = process.env.port || 5950
const app = express()

app.use(express.json())
app.use(cors())
// app.use("/uploads", express.static("uploads"))

// Routers
app.use(userRouter)
// app.use(adminRouter)
app.use(depositRouter)

app.listen(port, () => {
    console.log(`Server is active on port: ${port}`)
  })