const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PricingSchema = new Schema({
    name:{
        type: 'String',
        required: true
    },
    userId:{
        type: 'String',
        required: true
    },
    price:{
        type: 'Number',
        required: true
    },
    paymentID: {
        type: 'String',
    },
    payerId: {
        type: 'String'
    }
}, { 
    timestamps: true 
    }
)

const Pricing = mongoose.model('Pricing', PricingSchema)
module.exports = Pricing