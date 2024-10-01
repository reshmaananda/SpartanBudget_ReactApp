// __tests__/budget.test.js
const request = require('supertest');
// const app = require('../app'); 
const express = require('express');
const bodyParser = require('body-parser');
const { addBudget, getBudgets, deleteBudget, editBudget } = require('../Controllers/budget');
const BudgetSchema = require('../models/BudgetModel');

jest.mock('../models/BudgetModel');

const app = express();
app.use(bodyParser.json());

app.post('/add-budget', addBudget);
app.get('/get-budgets', getBudgets);
app.delete('/delete-budget', deleteBudget);
app.post('/edit-budget', editBudget);

describe('Budget API', () => {
    describe('POST /add-budget', () => {
        it('should add budgets successfully', async () => {
            const saveMock = jest.fn().mockResolvedValueOnce({});
            BudgetSchema.prototype.save = saveMock;

            const response = await request(app)
                .post('/add-budget')
                .send({
                    budgets: [
                        { budgetName: 'Test Budget', user: 'testUser', month: 'January', year: '2024', itemname: 'Test Item', type: 'Expense', amount: 100 }
                    ]
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Budgets successfully created');
            expect(saveMock).toHaveBeenCalled();
        });

        it('should return error for invalid input', async () => {
            const response = await request(app)
                .post('/add-budget')
                .send({ budgets: 'invalidData' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input. Expected an array of budget objects.');
        });
    });

    describe('GET /get-budgets', () => {
        it('get-budgets should get budgets successfully', async () => {
            BudgetSchema.find = jest.fn().mockResolvedValueOnce([
                { budgetName: 'July Budget', user: 'Anonymous', month: 'July', year: '2024', itemname: 'Car Insurance', type: 'Insurance', amount: 100 }
            ]);

            const response = await request(app)
                .get('/get-budgets')
                .query({ user: 'Anonymous', month: 'July', year: '2024' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { budgetName: 'July Budget', user: 'Anonymous', month: 'July', year: '2024', itemname: 'Car Insurance', type: 'Insurance', amount: 100 }
            ]);
        });

        it('should return error for missing parameters', async () => {
            const response = await request(app)
                .get('/get-budgets')
                .query({ user: 'testUser', month: 'January' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, month, and year are required.');
        });
    });

    describe('DELETE /delete-budget', () => {
        it('should delete budgets successfully', async () => {
            BudgetSchema.deleteMany = jest.fn().mockResolvedValueOnce({ deletedCount: 1 });

            const response = await request(app)
                .delete('/delete-budget')
                .send({ user: 'testUser', month: 'January', year: '2024' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('1 budgets deleted');
        });

        it('should return error for missing parameters', async () => {
            const response = await request(app)
                .delete('/delete-budget')
                .send({ user: 'testUser', month: 'January' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, month, and year are required.');
        });
    });

    describe('POST /edit-budget', () => {
        it('should edit budgets successfully', async () => {
            BudgetSchema.deleteMany = jest.fn().mockResolvedValueOnce({});
            BudgetSchema.prototype.save = jest.fn().mockResolvedValueOnce({});

            const response = await request(app)
                .post('/edit-budget')
                .send({
                    user: 'testUser',
                    month: 'January',
                    year: '2024',
                    budgetsToUpdate: [
                        { budgetName: 'Updated Budget', user: 'testUser', month: 'January', year: '2024', itemname: 'Updated Item', type: 'Expense', amount: 200 }
                    ]
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Budgets successfully updated');
        });

        it('should return error for invalid input', async () => {
            const response = await request(app)
                .post('/edit-budget')
                .send({
                    user: 'testUser',
                    month: 'January',
                    year: '2024',
                    budgetsToUpdate: 'invalidData'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input. User, month, year, and budgetsToUpdate are required, and budgetsToUpdate must be an array.');
        });
    });
});
