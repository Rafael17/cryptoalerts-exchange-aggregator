require('dotenv').config()
const Price = require('./models/price')
const fetch = require('node-fetch')
const priceAlertsURL = 'http://localhost/api/priceAlerts'

const checkExchangePriceToUserPriceAlert = async () => {
    const { alerts, prices } = await fetchPricesAndAlerts()
    if (alerts.length === 0) {
        return;
    }

    alertsExchanges = Object.keys(prices);
    alertsExchanges.map((exchange) => {
        alerts.map(alert => {
            if (alert.price < prices[exchange][alert.pair] && alert.cross == 'Cross Up') {
                triggerAlert(alert, "above");
            } if (alert.price > prices[exchange][alert.pair] && alert.cross == 'Cross Down') {
                triggerAlert(alert, "below");
            }
        })
    })
}

const triggerAlert = async (alert, b) => {
    // use message queue instead
    const response = await fetch(priceAlertsURL + '/' + alert._id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'TRIGGERED' })
    });
    const result = await response.json()
    console.log(result)
}

const fetchPricesAndAlerts = async () => {
    const prices = await Price.find()
    let alerts = []
    try {
        const response = await fetch(priceAlertsURL + '/?status=')
        alerts = await response.json()
    } catch (e) {
        console.log(e)
    }

    const newPrices = prices.reduce((acc, value) => {
        acc[value['name']] = value.tickers;
        return acc;
    }, {})

    return { alerts, prices: newPrices }
}

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_CONNECTION_STRING, { useFindAndModify: false })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log('connected to database')
    setInterval(checkExchangePriceToUserPriceAlert, 1000)
})