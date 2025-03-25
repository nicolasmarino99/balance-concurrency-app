const express = require('express');
const { Sequelize, Transaction } = require('sequelize');
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

  let transaction;
  try {
    transaction = await db.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = user.balance + numericAmount;
    if (newBalance < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    await user.update({ balance: newBalance }, { transaction });
    await transaction.commit();

    res.json({ 
      userId, 
      oldBalance: user.balance - numericAmount, 
      newBalance,
      amount: numericAmount 
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;