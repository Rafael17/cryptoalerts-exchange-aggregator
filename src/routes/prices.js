const express = require('express')
const router = express.Router()
const Price = require('../models/price')

router.get('/', async (req, res) => {
    try {
        const prices = await Price.find()
        res.json(prices)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

module.exports = router