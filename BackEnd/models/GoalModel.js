const mongoose = require('mongoose');

const GoalsSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    goalItem: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true
    },
    amountRequired: {
        type: Number,
        required: true,
        maxLength: 20,
        trim: true
    },
    amountSaved: {
        type: Number,
        required: true,
        maxLength: 20,
        trim: true
    },
    notes: {
        type: String,
        required: false,
        maxLength: 200,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
    
}, {timestamps: true})

module.exports = mongoose.model('Goal', GoalsSchema)