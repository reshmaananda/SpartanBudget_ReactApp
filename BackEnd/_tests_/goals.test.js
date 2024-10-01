// __tests__/goals.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { addGoal, deleteGoal, editGoal, checkGoalExists, getGoals } = require('../Controllers/goals');
const GoalSchema = require('../models/GoalModel');

jest.mock('../models/GoalModel');

const app = express();
app.use(bodyParser.json());

app.post('/add-goal', addGoal);
app.delete('/delete-goal', deleteGoal);
app.post('/edit-goal', editGoal);
app.get('/check-goal-exists', checkGoalExists);
app.get('/get-goals', getGoals);

describe('Goals API', () => {
    describe('POST /add-goal', () => {
        it('should add a goal successfully', async () => {
            const saveMock = jest.fn().mockResolvedValueOnce({});
            GoalSchema.prototype.save = saveMock;

            const response = await request(app)
                .post('/add-goal')
                .send({
                    user: 'testUser',
                    goalItem: 'Buy a car',
                    amountRequired: 10000,
                    amountSaved: 5000,
                    notes: 'Saving for a car'
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Goal successfully created');
            expect(saveMock).toHaveBeenCalled();
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .post('/add-goal')
                .send({
                    user: 'testUser',
                    amountRequired: 10000,
                    amountSaved: 5000
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, goalItem, amountRequired, and amountSaved are required!');
        });

        it('should return error for invalid amounts', async () => {
            const response = await request(app)
                .post('/add-goal')
                .send({
                    user: 'testUser',
                    goalItem: 'Buy a car',
                    amountRequired: -10000,
                    amountSaved: -5000
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('amountRequired must be a positive number and amountSaved must be a non-negative number!');
        });
    });

    describe('DELETE /delete-goal', () => {
        it('should delete a goal successfully', async () => {
            GoalSchema.findOneAndDelete = jest.fn().mockResolvedValueOnce({});

            const response = await request(app)
                .delete('/delete-goal')
                .send({ user: 'testUser', goalItem: 'Buy a car' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Goal successfully deleted');
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .delete('/delete-goal')
                .send({ user: 'testUser' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User and goalItem are required!');
        });

        it('should return error if goal not found', async () => {
            GoalSchema.findOneAndDelete = jest.fn().mockResolvedValueOnce(null);

            const response = await request(app)
                .delete('/delete-goal')
                .send({ user: 'testUser', goalItem: 'Buy a car' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Goal not found');
        });
    });

    describe('POST /edit-goal', () => {
        it('should edit a goal successfully', async () => {
            GoalSchema.findOne = jest.fn().mockResolvedValueOnce({});
            GoalSchema.findOneAndDelete = jest.fn().mockResolvedValueOnce({});
            GoalSchema.prototype.save = jest.fn().mockResolvedValueOnce({});

            const response = await request(app)
                .post('/edit-goal')
                .send({
                    user: 'testUser',
                    goalItem: 'Buy a car',
                    updatedGoal: {
                        amountRequired: 20000,
                        amountSaved: 10000
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Goal successfully updated');
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .post('/edit-goal')
                .send({
                    user: 'testUser',
                    updatedGoal: {
                        amountRequired: 20000,
                        amountSaved: 10000
                    }
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, goalItem, and updatedGoal are required!');
        });

        it('should return error if goal not found', async () => {
            GoalSchema.findOne = jest.fn().mockResolvedValueOnce(null);

            const response = await request(app)
                .post('/edit-goal')
                .send({
                    user: 'testUser',
                    goalItem: 'Buy a car',
                    updatedGoal: {
                        amountRequired: 20000,
                        amountSaved: 10000
                    }
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Goal not found');
        });
    });

    describe('GET /check-goal-exists', () => {
        it('should return true if goal exists', async () => {
            GoalSchema.findOne = jest.fn().mockResolvedValueOnce({});

            const response = await request(app)
                .get('/check-goal-exists')
                .query({ user: 'testUser', goalItem: 'Buy a car' });

            expect(response.status).toBe(200);
            expect(response.body.goalExists).toBe(true);
        });

        it('should return false if goal does not exist', async () => {
            GoalSchema.findOne = jest.fn().mockResolvedValueOnce(null);

            const response = await request(app)
                .get('/check-goal-exists')
                .query({ user: 'testUser', goalItem: 'Buy a car' });

            expect(response.status).toBe(200);
            expect(response.body.goalExists).toBe(false);
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .get('/check-goal-exists')
                .query({ user: 'testUser' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User and goalItem are required!');
        });
    });

    describe('GET /get-goals', () => {
        it('should get all goals for a user successfully', async () => {
            GoalSchema.find = jest.fn().mockResolvedValueOnce([{ user: 'testUser', goalItem: 'Buy a car', amountRequired: 10000, amountSaved: 5000 }]);

            const response = await request(app)
                .get('/get-goals')
                .query({ user: 'testUser' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Goals retrieved successfully');
            expect(response.body.goals).toEqual([{ user: 'testUser', goalItem: 'Buy a car', amountRequired: 10000, amountSaved: 5000 }]);
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .get('/get-goals')
                .query({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User is required!');
        });

        it('should return error if no goals found', async () => {
            GoalSchema.find = jest.fn().mockResolvedValueOnce([]);

            const response = await request(app)
                .get('/get-goals')
                .query({ user: 'testUser' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('No goals found for this user');
        });
    });
});