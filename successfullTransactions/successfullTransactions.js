const axios = require('axios')
require("dotenv").config()

// Replace with your actual payment service API base URL and endpoint
const PAYMENT_SERVICE_BASE_URL = 'https://api.korapay.com/v1'


// Function to confirm a transaction
const confirmTransaction = async (transactionId) => {
    try {
        const response = await axios.get(`${PAYMENT_SERVICE_BASE_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`
            }
        })
        return response.data
    } catch (error) {
        res.status(500).json({
            error: error.message 
       })
    }
}


module.exports = confirmTransaction