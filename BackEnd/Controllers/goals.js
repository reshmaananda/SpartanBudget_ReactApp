const GoalSchema= require("../models/GoalModel");
exports.addGoal = async (req, res) => {
    const goalData = req.body; 

    try {
        const { user, goalItem, amountRequired, amountSaved, notes } = goalData;

        // Validate input
        if (!user || !goalItem || amountRequired === undefined || amountSaved === undefined) {
            return res.status(400).json({
                message: 'User, goalItem, amountRequired, and amountSaved are required!'
            });
        }
        if (amountRequired <= 0 || amountSaved < 0 || typeof amountRequired !== 'number' || typeof amountSaved !== 'number') {
            return res.status(400).json({
                message: 'amountRequired must be a positive number and amountSaved must be a non-negative number!'
            });
        }

        // Create a new goal
        const goal = new GoalSchema({
            user,
            goalItem,
            amountRequired,
            amountSaved,
            notes: notes || '',// Optional field
            date: new Date() // Current date
        });

        // Save the goal to the database
        const savedGoal = await goal.save();

        // Respond with success
        res.status(201).json({
            message: 'Goal successfully created',
            goal: savedGoal
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            message: 'Error creating goal',
            error: error.message
        });
    }
};


// Delete a goal based on user and goalItem
exports.deleteGoal = async (req, res) => {
    const { user, goalItem } = req.body; 

    try {
        // Validate input
        if (!user || !goalItem) {
            return res.status(400).json({
                message: 'User and goalItem are required!'
            });
        }

        // Find and delete the goal
        const result = await GoalSchema.findOneAndDelete({ user, goalItem });

        if (!result) {
            return res.status(404).json({
                message: 'Goal not found'
            });
        }

        res.status(200).json({
            message: 'Goal successfully deleted',
            deletedGoal: result
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting goal',
            error
        });
    }
};
    
exports.editGoal = async (req, res) => {
    const { user, goalItem, updatedGoal } = req.body;

    try {
        // Validate input
        if (!user || !goalItem || !updatedGoal) {
            return res.status(400).json({
                message: 'User, goalItem, and updatedGoal are required!'
            });
        }
        if (typeof updatedGoal !== 'object' || Object.keys(updatedGoal).length === 0) {
            return res.status(400).json({
                message: 'UpdatedGoal must be a valid object with the necessary fields!'
            });
        }
        if (updatedGoal.amountRequired !== undefined && (updatedGoal.amountRequired <= 0 || typeof updatedGoal.amountRequired !== 'number')) {
            return res.status(400).json({
                message: 'AmountRequired must be a positive number!'
            });
        }
        if (updatedGoal.amountSaved !== undefined && (updatedGoal.amountSaved < 0 || typeof updatedGoal.amountSaved !== 'number')) {
            return res.status(400).json({
                message: 'AmountSaved must be a non-negative number!'
            });
        }

        // Check if the existing goal exists
        const existingGoal = await GoalSchema.findOne({ user, goalItem });
        
        if (!existingGoal) {
            return res.status(404).json({
                message: 'Goal not found'
            });
        }

        // Delete the existing goal
        await GoalSchema.findOneAndDelete({ user, goalItem });

        // Create a new goal with updated fields
        const newGoal = new GoalSchema({
            user: updatedGoal.user || user, // Use provided user or original
            goalItem: updatedGoal.goalItem || goalItem, // Use provided goalItem or original
            amountRequired: updatedGoal.amountRequired,
            amountSaved: updatedGoal.amountSaved,
            notes: updatedGoal.notes || '', // Optional field
            date: new Date() // Current date
        });

        const savedGoal = await newGoal.save();

        res.status(201).json({
            message: 'Goal successfully updated',
            goal: savedGoal
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating goal',
            error: error.message
        });
    }
};


exports.checkGoalExists = async (req, res) => {
    const { user, goalItem } = req.query; // Extract user and goalItem from query parameters

    try {
        // Validate input
        if (!user || !goalItem) {
            return res.status(400).json({
                message: 'User and goalItem are required!'
            });
        }

        // Find the goal
        const existingGoal = await GoalSchema.findOne({ user, goalItem });

        // Return a boolean indicating if the goal exists
        res.status(200).json({
            goalExists: !!existingGoal // Convert existingGoal to a boolean
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error checking goal existence',
            error: error.message
        });
    }
};


// Get all goals for a specific user
exports.getGoals = async (req, res) => {
    const { user } = req.query;  // Use req.query to get query parameters

    try {
        if (!user) {
            return res.status(400).json({
                message: 'User is required!'
            });
        }

        const goals = await GoalSchema.find({ user });

        if (goals.length === 0) {
            return res.status(404).json({
                message: 'No goals found for this user'
            });
        }

        res.status(200).json({
            message: 'Goals retrieved successfully',
            goals
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving goals',
            error: error.message
        });
    }
};


