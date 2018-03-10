const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');

const baseSchema = new mongoose.Schema({
  created: Date,
  updated: Date
});

baseSchema.virtual('id').get(function () {
  return this._id;
});

// baseSchema.set('toJSON', {virtuals: true});
// baseSchema.set('toObject', {virtuals: true});




const userSchema = extendSchema(baseSchema, {
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
  blurb: String,
  // created: Date,
  // updated: Date
});
const User = mongoose.model('User', userSchema);

const storySchema = extendSchema(baseSchema, {
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
  // created: Date,
  // updated: Date,
  type: {
    type: String,
    enum: ['article', 'response'],
    required: true
  },
  parent_id: String
});

const Story = mongoose.model('Story', storySchema);

const articleSchema = extendSchema(baseSchema, {
  title: {
    type: String,
    required: true
  },
  description: String,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  // created: Date,
  // updated: Date,
});

articleSchema.virtual('date').get(function () {
  return this.updated;
});
const Article = mongoose.model('Article', articleSchema);
articleSchema.virtual('time').get(function () {
  return this.body.split(" ").length / 200; //avg person reads 200 wpm
});
articleSchema.virtual('blurb').get(function () {
  return this.description || this.body.slice(0, 140);
});
articleSchema.virtual('realBlurb').get(function () {
  return !!this.description;
})

const responseSchema = mongoose.Schema({

});
const Response = mongoose.model('Response', responseSchema);

const followSchema = mongoose.Schema({

});

const Follows = mongoose.model('Follows', followSchema)

userSchema.set('toJSON', {
  virtuals: true
});
articleSchema.set('toObject', {
  virtuals: true
});
module.exports = {
  User,
  Story,
  Article
};