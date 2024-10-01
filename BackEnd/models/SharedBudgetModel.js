const mongoose = require('mongoose');

const SharedUserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    perPersonCost: {
        type: Number,
        required: true
    }
});

const BudgetSchema = new mongoose.Schema({
    budgetName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
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
        type: Number,
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
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    sharedUsers: [SharedUserSchema]
}, { timestamps: true });

module.exports = mongoose.model('SharedBudget', BudgetSchema);
