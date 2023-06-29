const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { username, time } = req.body;
  const currentDate = new Date().toISOString().split('T')[0];  // 오늘 날짜

  // user 찾고 watchTime update
  await User.findOneAndUpdate(
    { username, 'watchTime.date': currentDate }, 
    { $inc: { 'watchTime.$.time': time } },
    { upsert: true }
  );

  res.sendStatus(200);
});

module.exports = router;