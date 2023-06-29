const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  watchTime: [{
    date: Date,
    time: Number
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = { User }