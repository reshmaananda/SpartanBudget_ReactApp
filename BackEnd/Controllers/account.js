const AccountSchema= require("../models/AccountModel")

exports.addAccount = async (req, res) => {
    const accountsData = req.body.accounts; // The list of accounts is sent in req.body.accounts

    if (!Array.isArray(accountsData)) {
        return res.status(400).json({
            message: 'Invalid input. Expected an array of account objects.'
        });
    }

    try {
        accountsData.forEach(data => {
            const { user, month, year, accountname, type, amount } = data;
            if (!user || !month || !year || !accountname || !type) {
                throw new Error('All fields are required!');
            }
            if (amount <= 0 || typeof amount !== 'number') {
                throw new Error('Amount must be a positive number!');
            }
        });

        const accounts = accountsData.map(data => {
            const { user, month, year, accountname, type, amount } = data;
            return new AccountSchema({
                user,
                month,
                year,
                accountname,
                type,
                amount
            });
        });

        // Save all accounts to the database
        const savedAccounts = await Promise.all(accounts.map(account => account.save()));

        res.status(201).json({
            message: 'Accounts successfully created',
            accounts: savedAccounts
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating accounts',
            error
        });
    }
};

exports.getAccounts = async (req, res) => {
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
        const accounts = await AccountSchema.find(query).sort({ createdAt: -1 });

        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.deleteAccount = async (req, res) => {
    const { user, month, year} = req.body;

    try {
        // Debugging output to ensure parameters are being read correctly
        console.log('Received delete parameters:', { user, month, year });

        // Check if all parameters are provided
        if (!user || !month || !year ) {
            return res.status(400).json({
                message: 'User, month, year are required.'
            });
        }

        // Build query object
        const query = {
            user: user.trim(),
            month: month.trim(),
            year: year.trim()
        };
        
        console.log('Constructed query:', query);
        const documents = await AccountSchema.find(query);
        console.log('Documents found:', documents);


        // Delete Accounts based on query filters
        const result = await AccountSchema.deleteMany(query);

        console.log('Deletion result:', result);

        res.status(200).json({ message: `${result.deletedCount} accounts deleted` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.editAccount = async (req, res) => {
    const { user, month, year, accountsToUpdate } = req.body;

    if (!user || !month || !year || !Array.isArray(accountsToUpdate)) {
        return res.status(400).json({ message: 'Invalid input. User, month, year, and accountsToUpdate are required, and accountsToUpdate must be an array.' });
    }

    try {
        // Delete all existing accounts for the user, month, and year
        const deleteQuery = { user, month, year };
        await AccountSchema.deleteMany(deleteQuery);
        console.log('Existing accounts deleted');

        // Create new accounts from the accountsToUpdate array
        const accounts = accountsToUpdate.map(account => new AccountSchema(account));

        // Save all new accounts to the database
        const savedAccounts = await Promise.all(accounts.map(account => account.save()));

        res.status(201).json({
            message: 'Accounts successfully updated',
            accounts: savedAccounts
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating accounts', error: error.message });
    }
};