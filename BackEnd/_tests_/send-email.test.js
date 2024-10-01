// __tests__/sendEmail.test.js
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { sendEmailHandler } = require('../Controllers/send-email');

jest.mock('nodemailer');

const app = express();
app.use(bodyParser.json());
app.post('/send-email', sendEmailHandler);

describe('Send Email API', () => {
    let transporterMock;
    let sendMailMock;

    beforeEach(() => {
        sendMailMock = jest.fn();
        transporterMock = { sendMail: sendMailMock };
        nodemailer.createTransport.mockReturnValue(transporterMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /send-email', () => {
        it('should send email successfully', async () => {
            sendMailMock.mockResolvedValueOnce({});

            const response = await request(app)
                .post('/send-email')
                .send({
                    recipients: 'test@example.com',
                    subject: 'Test Subject',
                    message: 'Test Message'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Emails sent successfully!');
            expect(sendMailMock).toHaveBeenCalledWith({
                from: 'spartonbudget@gmail.com',
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Message',
                html: '<h1>Hello world</h1>'
            });
        });

        it('should return error if email sending fails', async () => {
            sendMailMock.mockRejectedValueOnce(new Error('Failed to send email'));

            const response = await request(app)
                .post('/send-email')
                .send({
                    recipients: 'test@example.com',
                    subject: 'Test Subject',
                    message: 'Test Message'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to send emails.');
            expect(response.body.error).toBeDefined();
            expect(sendMailMock).toHaveBeenCalledWith({
                from: 'spartonbudget@gmail.com',
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Message',
                html: '<h1>Hello world</h1>'
            });
        });

        it('should return error for missing required fields', async () => {
            const response = await request(app)
                .post('/send-email')
                .send({
                    subject: 'Test Subject',
                    message: 'Test Message'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Recipients are required.');
        });
    });
});
