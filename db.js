const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordDigest: {
    type: String,
    required: true
  },
  sessionToken: String,
  blurb: String,
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
  authorId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  text: {
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

const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  blurb: String,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  created: Date,
  updated: Date,
});
const Article = mongoose.model('Article', articleSchema);

const responseSchema = mongoose.Schema( {

});
const Response = mongoose.model('Response', responseSchema);

const followSchema = mongoose.Schema( {

});

const Follows = mongoose.model('Follows', followSchema)
module.exports = {  User, Story, Article };