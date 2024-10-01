const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary
const SharedUserSchema = require('../models/SharedBudgetModel');
const { sendEmailHandler } = require('../Controllers/send-email');

jest.mock('../models/SharedBudgetModel');
jest.mock('../controllers/send-email');

describe('Shared Budget API', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test for adding a shared budget
  describe('POST /add-shared-budget', () => {
    it('should add shared budgets successfully', async () => {
      // Mocking database save and email handler
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'someId',
        ...req.body
      });
      SharedUserSchema.prototype.save = mockSave;

      sendEmailHandler.mockResolvedValue(true);

      const requestBody = [
        {
          user: 'testUser',
          month: 'January',
          year: '2024',
          budgetName: 'Test Budget',
          sharedUsers: [{ userEmail: 'user@example.com' }],
        }
      ];

      const response = await request(app)
        .post('/add-shared-budget')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Budgets successfully created');
      expect(response.body.budgets).toHaveLength(1);
      expect(SharedUserSchema.prototype.save).toHaveBeenCalledTimes(1);
      expect(sendEmailHandler).toHaveBeenCalledTimes(1);
    });
  });

  // Test for getting shared budgets
  describe('GET /get-shared-budgets', () => {
    it('should get shared budgets successfully', async () => {
      // Mocking database find
      SharedUserSchema.find = jest.fn().mockResolvedValue([
        {
          _id: 'someId',
          user: 'testUser',
          month: 'January',
          year: '2024',
          budgetName: 'Test Budget'
        }
      ]);

      const response = await request(app)
        .get('/get-shared-budgets')
        .query({ user: 'testUser', month: 'January', year: '2024' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].budgetName).toBe('Test Budget');
      expect(SharedUserSchema.find).toHaveBeenCalledWith({
        user: 'testUser',
        month: 'January',
        year: '2024'
      });
    });
  });

  // Test for deleting shared budgets
  describe('DELETE /delete-shared-budget', () => {
    it('should delete shared budgets successfully', async () => {
      // Mocking database deleteMany
      SharedUserSchema.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .delete('/delete-shared-budget')
        .send({ user: 'testUser', month: 'January', year: '2024' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('1 budgets deleted');
      expect(SharedUserSchema.deleteMany).toHaveBeenCalledWith({
        user: 'testUser',
        month: 'January',
        year: '2024'
      });
    });
  });

  // Test for editing shared budgets
  describe('PUT /edit-shared-budget', () => {
    it('should edit shared budgets successfully', async () => {
      // Mocking database deleteMany and save
      SharedUserSchema.deleteMany = jest.fn().mockResolvedValue({});
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'someId',
        ...req.body
      });
      SharedUserSchema.prototype.save = mockSave;

      sendEmailHandler.mockResolvedValue(true);

      const requestBody = {
        user: 'testUser',
        month: 'January',
        year: '2024',
        budgetsToUpdate: [
          {
            user: 'testUser',
            month: 'January',
            year: '2024',
            budgetName: 'Updated Budget',
            sharedUsers: [{ userEmail: 'user@example.com' }],
          }
        ]
      };

      const response = await request(app)
        .put('/edit-shared-budget')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Budget successfully updated');
      expect(response.body.budget).toHaveLength(1);
      expect(SharedUserSchema.deleteMany).toHaveBeenCalledWith({
        user: 'testUser',
        month: 'January',
        year: '2024'
      });
      expect(SharedUserSchema.prototype.save).toHaveBeenCalledTimes(1);
      expect(sendEmailHandler).toHaveBeenCalledTimes(1);
    });
  });
});
