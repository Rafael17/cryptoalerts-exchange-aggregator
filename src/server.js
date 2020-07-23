require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())
app.use(cors())

const pricesRouter = require('./routes/prices')
app.use('/prices', pricesRouter)

const port = 3010;
app.listen(port, () => console.log(`server started at port ${port}`))