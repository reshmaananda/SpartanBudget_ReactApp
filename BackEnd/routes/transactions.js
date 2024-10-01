const { addBudget, getBudgets, deleteBudget, editBudget } = require('../Controllers/budget');
const { addSharedBudget, getSharedBudgets, deleteSharedBudget, editSharedBudget } = require('../Controllers/sharedBudget');
const { addAccount, getAccounts, deleteAccount, editAccount } = require('../Controllers/account');
const { getGoals, editGoal, deleteGoal, addGoal, checkGoalExists} = require('../Controllers/goals');
const { sendEmailHandler } = require('../Controllers/send-email');

const router = require('express').Router();

router.post('/add-budget', addBudget)
    .get('/get-budgets', getBudgets)
    .delete('/delete-budget', deleteBudget)
    .post('/edit-budget', editBudget)
    .post('/add-shared-budget', addSharedBudget) 
    .get('/get-shared-budgets', getSharedBudgets) 
    .delete('/delete-shared-budget', deleteSharedBudget) 
    .post('/edit-shared-budget', editSharedBudget) 
    .post('/add-account', addAccount)
    .get('/get-accounts', getAccounts)
    .delete('/delete-account', deleteAccount)
    .post('/edit-account', editAccount)
    .post('/send-email', sendEmailHandler)
    .get('/get-goals',getGoals)
    .post('/add-goal', addGoal)
    .delete('/delete-goal', deleteGoal)
    .post('/edit-goal', editGoal)
    .get('/checkGoalExists', checkGoalExists);

module.exports = router;
