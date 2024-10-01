// __tests__/accounts.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { addAccount, getAccounts, deleteAccount, editAccount } = require('../Controllers/account');
const AccountSchema = require('../models/AccountModel');

jest.mock('../models/AccountModel');

const app = express();
app.use(bodyParser.json());

app.post('/add-account', addAccount);
app.get('/get-accounts', getAccounts);
app.delete('/delete-account', deleteAccount);
app.post('/edit-account', editAccount);

describe('Accounts API', () => {
    describe('POST /add-account', () => {
        it('should add accounts successfully', async () => {
            AccountSchema.prototype.save = jest.fn().mockResolvedValueOnce({});
            const response = await request(app)
                .post('/add-account')
                .send({ accounts: [{ user: 'testUser', month: 'January', year: '2024', accountname: 'Savings', type: 'Deposit', amount: 1000 }] });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Accounts successfully created');
        });

        it('should return error for invalid input', async () => {
            const response = await request(app)
                .post('/add-account')
                .send({ accounts: 'invalidData' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input. Expected an array of account objects.');
        });
    });

    describe('GET /get-accounts', () => {
        it('should return accounts based on query parameters', async () => {
            AccountSchema.find = jest.fn().mockResolvedValueOnce([{ user: 'testUser', month: 'January', year: '2024', accountname: 'Savings', type: 'Deposit', amount: 1000 }]);

            const response = await request(app)
                .get('/get-accounts')
                .query({ user: 'testUser', month: 'January', year: '2024' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ user: 'testUser', month: 'January', year: '2024', accountname: 'Savings', type: 'Deposit', amount: 1000 }]);
        });

        it('should return error for missing query parameters', async () => {
            const response = await request(app)
                .get('/get-accounts')
                .query({ user: 'testUser', month: 'January' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, month, and year are required.');
        });
    });

    describe('DELETE /delete-account', () => {
        it('should delete accounts successfully', async () => {
            AccountSchema.deleteMany = jest.fn().mockResolvedValueOnce({ deletedCount: 1 });

            const response = await request(app)
                .delete('/delete-account')
                .send({ user: 'testUser', month: 'January', year: '2024', accountname: 'Savings' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('1 accounts deleted');
        });

        it('should return error for missing parameters', async () => {
            const response = await request(app)
                .delete('/delete-account')
                .send({ user: 'testUser', month: 'January', year: '2024' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User, month, year and accountname are required.');
        });
    });

    describe('POST /edit-account', () => {
        it('should edit accounts successfully', async () => {
            AccountSchema.deleteMany = jest.fn().mockResolvedValueOnce({});
            AccountSchema.prototype.save = jest.fn().mockResolvedValueOnce({});

            const response = await request(app)
                .post('/edit-account')
                .send({
                    user: 'testUser',
                    month: 'January',
                    year: '2024',
                    accountsToUpdate: [{ user: 'testUser', month: 'January', year: '2024', accountname: 'Savings', type: 'Deposit', amount: 1000 }]
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Accounts successfully updated');
        });

        it('should return error for invalid input', async () => {
            const response = await request(app)
                .post('/edit-account')
                .send({
                    user: 'testUser',
                    month: 'January',
                    year: '2024',
                    accountsToUpdate: 'invalidData'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid input. User, month, year, and accountsToUpdate are required, and accountsToUpdate must be an array.');
        });
    });
});
