const mongoose = require('mongoose')

const tickerSchema = new mongoose.Schema({
    ticker: {
        type: String
    },
    price: {
        type: Number
    }
})

const priceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tickers: {}
})

module.exports = mongoose.model('prices', priceSchema)