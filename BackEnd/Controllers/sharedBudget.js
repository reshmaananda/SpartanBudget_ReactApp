const SharedUserSchema = require("../models/SharedBudgetModel");
const { sendEmailHandler } = require('../Controllers/send-email');

// Add a shared budget
exports.addSharedBudget = async (req, res) => {
    const budgetData = req.body;

    if (!budgetData || !Array.isArray(budgetData)) {
        return res.status(400).json({
            message: 'Invalid input. Expected an array of budget objects.'
        });
    }

    try {
        const savedBudgets = [];
        for (const budget of budgetData) {
            const sharedBudget = new SharedUserSchema(budget);
            const savedBudget = await sharedBudget.save();
            savedBudgets.push(savedBudget);
            // Send emails to shared users
            try {
                const recipients = budget.sharedUsers.map(user => user.userEmail);
                const subject = 'New Budget '+budget.budgetName+' has been Shared';
                const message = `A new budget for ${budget.month} ${budget.year} has been shared with you. Please check your budget list. `;
                await sendEmailHandler({ recipients, subject, message });
            } catch (emailError) {
                console.error('Error sending email:', emailError); // Log email sending errors
            }
        }

        res.status(201).json({
            message: 'Budgets successfully created',
            budgets: savedBudgets
        });
    } catch (error) {
        console.error('Error creating budgets:', error); // Add detailed logging
        res.status(500).json({
            message: 'Error creating budgets',
            error: error.message || error // Provide error details
        });
    }
};


// Get shared budgets
exports.getSharedBudgets = async (req, res) => {
    const { user, month, year } = req.query; // Get parameters from request body

    try {
        // Debugging output to ensure parameters are being read correctly
        console.log('Received request body:', { user, month, year });

        // Check if all parameters are provided
        if (!user || !month || !year) {
            return res.status(400).json({
                message: 'User, month, and year are required.'
            });
        }

        // Build query object
        const query = {
            user,
            month,
            year
        };

        // Fetch budgets based on query filters
        const budgets = await SharedUserSchema.find(query).sort({ createdAt: -1 });

        res.status(200).json(budgets);
    } catch (error) {
        console.error('Error fetching shared budgets:', error); // Add detailed logging
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message || error // Provide error details
        });
    }
};


// Delete shared budgets
exports.deleteSharedBudget = async (req, res) => {
    const { user, month, year } = req.body;

    try {
        if (!user || !month || !year) {
            return res.status(400).json({
                message: 'User, month, and year are required.'
            });
        }

        const result = await SharedUserSchema.deleteMany({
            user: user,
            month: month,
            year: year
        });

        res.status(200).json({ 
            message: `${result.deletedCount} budgets deleted` 
        });
    } catch (error) {
        console.error('Error deleting shared budgets:', error); // Add detailed logging
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message || error // Provide error details
        });
    }
};


// Edit shared budget
exports.editSharedBudget = async (req, res) => {
    const { user, month, year, budgetsToUpdate } = req.body;

    if (!user || !month || !year) {
        return res.status(400).json({
            message: 'Invalid input. User, month, year is required'
        });
    }

    try {
        // Delete the existing budget for the user, month, and year
        await SharedUserSchema.deleteMany({
            user: user,
            month: month,
            year: year
        });
        console.log('Existing shared budgets deleted');
        // Create new budgets from the budgetsToUpdate array
        console.log('budgetToUpdate ',budgetsToUpdate);
        const budgets = budgetsToUpdate.map(budget => new SharedUserSchema(budget));

        // Save all new budgets to the database
        const savedBudgets = await Promise.all(budgets.map(budget => budget.save()));
        
        budgetsToUpdate.map(budget => {
            try {
                const recipients = budget.sharedUsers.map(user => user.userEmail);
                const subject = 'Budget '+budget.budgetName+' has been Updated';
                const message = `The budget for ${budget.month} ${budget.year} has been updated. Please check your updated budget list.`;
                sendEmailHandler({ recipients, subject, message });
            } catch (emailError) {
                console.error('Error sending email:', emailError); // Log email sending errors
            }
        });

        res.status(201).json({
            message: 'Budget successfully updated',
            budget: savedBudgets
        });
    } catch (error) {
        console.error('Error updating budget:', error); // Add detailed logging
        res.status(500).json({ 
            message: 'Error updating budget', 
            error: error.message || error // Provide error details
        });
    }
};

