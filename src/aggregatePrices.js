require('dotenv').config();

const request = require('request');
const ExchangePrice = require('./models/price');

const BINANCE_PRICES_URL = "https://api.binance.com/api/v3/ticker/price"
const BITMEX_PRICES_URL = "https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=100&reverse=true"

const exchangeHTTPRequest = (url, callback) => {
    request({ url: url, json: true, method: "GET", timeout: 10000 }, (err, res, body) => {
        if (err)
            return console.error(err);
        callback(body);
    });
}

const requestLoop = (milliseconds, url, callback) => {
    setInterval(() => {
        exchangeHTTPRequest(url, callback);
    }, milliseconds);
}


const Bitmex = {
    start: () => {
        requestLoop(3000, BITMEX_PRICES_URL, async (data) => {
            if (!Array.isArray(data)) {
                return;
            }
            const tickers = data.reduce((acc, { symbol, close }) => {
                acc[symbol] = close * 1;
                return acc;
            }, {});
            let doc = await ExchangePrice.findOneAndUpdate({ name: 'Bitmex' }, { tickers: tickers }, {
                new: true,
                upsert: true
            });
        });
    }
}

const Binance = {
    start: () => {
        requestLoop(1000, BINANCE_PRICES_URL, async (data) => {
            const tickers = data.reduce((acc, { symbol, price }) => {
                acc[symbol] = price * 1;
                return acc;
            }, {});
            let doc = await ExchangePrice.findOneAndUpdate({ name: 'Binance' }, { tickers: tickers }, {
                new: true,
                upsert: true
            });
        });
    }
}

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_CONNECTION_STRING, { useFindAndModify: false })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log('connected to database')
    Binance.start();
    Bitmex.start();
})



