const mongoose = require('mongoose');


const AccountSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    month: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true,
        trim: true
    },
    accountname: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        maxLength: 20,
        trim: true
    },
    
}, {timestamps: true})

module.exports = mongoose.model('Account', AccountSchema)