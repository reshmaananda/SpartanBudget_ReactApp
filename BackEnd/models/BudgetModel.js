const mongoose = require('mongoose');


const BudgetSchema = new mongoose.Schema({
    budgetName:{
        type: String,
        required: true,
        trim: true,
        maxlength: 50

    },
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
    itemname: {
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
    date: {
        type: Date,
        required: true,
        trim: true
    },
    
}, {timestamps: true})

module.exports = mongoose.model('Budget', BudgetSchema)