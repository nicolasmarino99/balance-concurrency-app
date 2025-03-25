const express = require('express');
const { Transaction } = require('sequelize');
const router = express.Router();
const db = require('../models');
const User = db.User;

router.post('/update', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || amount === undefined) {
    return res.status(400).json({ error: 'userId and amount are required' });
  }

  const numericAmount = parseInt(amount);
  if (isNaN(numericAmount)) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  const transaction = await db.sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
  });

  try {
    const user = await User.findByPk(userId, { 
      transaction, 
      lock: Transaction.LOCK.UPDATE 
    });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const oldBalance = user.balance;
    const newBalance = oldBalance + numericAmount;
    
    if (newBalance < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Недостаточно средств' });
    }

    await user.increment('balance', {
      by: numericAmount,
      transaction
    });

    await transaction.commit();
    
    return res.json({ 
      userId, 
      oldBalance,
      newBalance,
      amount: numericAmount 
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      userId: user.id,
      balance: user.balance 
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset', async (req, res) => {
  const { userId, balance } = req.body;

  if (!userId || balance === undefined) {
    return res.status(400).json({ error: 'userId and balance are required' });
  }
  const numericBalance = parseInt(balance);
  if (isNaN(numericBalance)) {
    return res.status(400).json({ error: 'balance must be a number' });
  }

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({ balance: numericBalance });
    return res.json({ 
      message: 'Balance reset successfully',
      userId,
      newBalance: numericBalance
    });
  } catch (error) {
    console.error('Reset balance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;