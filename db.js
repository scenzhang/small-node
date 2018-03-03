const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordDigest: {
    type: String,
    required: true
  },
  sessionToken: String,
  created: Date,
  updated: Date
});
const User = mongoose.model('User', userSchema);

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  blurb: String,
  author_id: {
    type: String,
    required: true
  },
  created: Date,
  updated: Date,
  type: {
    type: String,
    enum: ['article', 'response'],
    required: true
  },
  parent_id: String
});

const Story = mongoose.model('Story', storySchema);


module.exports = {  User, Story };