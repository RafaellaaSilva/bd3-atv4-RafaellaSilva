const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', PostSchema);
