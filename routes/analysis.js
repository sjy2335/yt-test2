const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get("/analysis/:username", async function (req, res) {
  try {
    const {username} = req.params;
    const user = await User.findOne({username});
    const watchTime = user.watchTime;
    res.render("analysis", { user, watchTime });
  } catch (error) {
    console.error("Error:", error);
    res.render("error");
  }
});

module.exports = router;