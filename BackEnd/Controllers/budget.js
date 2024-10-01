const BudgetSchema= require("../models/BudgetModel")


exports.addBudget = async (req, res) => {
    const budgetData = req.body.budgets; // The list of budgets is sent in req.body.budgets

    if (!Array.isArray(budgetData)) {
        return res.status(400).json({
            message: 'Invalid input. Expected an array of budget objects.'
        });
    }

    try {
        // Create a list of budgetData objects
        const budgets = budgetData.map(data => {
            const { budgetName, user, month, year, itemname, type, amount, date } = data;
            return new BudgetSchema({
                budgetName,
                user,
                month,
                year,
                itemname,
                type,
                amount,
                date
            });
        });

        // Save all budgets to the database
        const savedBudgets = await Promise.all(budgets.map(budget => budget.save()));

        res.status(201).json({
            message: 'Budgets successfully created',
            budgets: savedBudgets
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating budgets',
            error
        });
    }
};


exports.getBudgets = async (req, res) => {
    const { user, month, year } = req.query;
    try {
        // Debugging output to ensure parameters are being read correctly
        console.log('Received query parameters:', { user, month, year });

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
        const budgets = await BudgetSchema.find(query).sort({ createdAt: -1 });

        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteBudget = async (req, res) => {
    const { user, month, year } = req.body;

    try {
        // Debugging output to ensure parameters are being read correctly
        console.log('Received delete parameters:', { user, month, year });

        // Check if all parameters are provided
        if (!user || !month || !year) {
            return res.status(400).json({
                message: 'User, month, and year are required.'
            });
        }

        // Build query object
        const query = {
            user: user.trim(),
            month: month.trim(),
            year: year.trim()
        };
        
        console.log('Constructed query:', query);
        const documents = await BudgetSchema.find(query);
        console.log('Documents found:', documents);


        // Delete budgets based on query filters
        const result = await BudgetSchema.deleteMany(query);

        console.log('Deletion result:', result);

        res.status(200).json({ message: `${result.deletedCount} budgets deleted` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.editBudget = async (req, res) => {
    const { user, month, year, budgetsToUpdate } = req.body;

    if (!user || !month || !year || !Array.isArray(budgetsToUpdate)) {
        return res.status(400).json({ message: 'Invalid input. User, month, year, and budgetsToUpdate are required, and budgetsToUpdate must be an array.' });
    }

    try {
        // Delete all existing budgets for the user, month, and year
        const deleteQuery = { user, month, year };
        await BudgetSchema.deleteMany(deleteQuery);
        console.log('Existing budgets deleted');

        // Create new budgets from the budgetsToUpdate array
        const budgets = budgetsToUpdate.map(budget => new BudgetSchema(budget));

        // Save all new budgets to the database
        const savedBudgets = await Promise.all(budgets.map(budget => budget.save()));

        res.status(201).json({
            message: 'Budgets successfully updated',
            budgets: savedBudgets
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating budgets', error: error.message });
    }
};