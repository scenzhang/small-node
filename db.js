const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
articleSchema.plugin(mongooseLeanVirtuals);

const readTime = (text) => {
  return text.split(" ").length / 200; //avg person reads 200 wpm
}
articleSchema.virtual('date').get(function () {
  return this.updated;
});
const Article = mongoose.model('Article', articleSchema);
articleSchema.virtual('time').get(function () {
  return readTime(this.body);
});
articleSchema.virtual('blurb').get(function () {
  return this.description || this.body.slice(0, 140);
});
articleSchema.virtual('realBlurb').get(function () {
  return !!this.description;
});

const responseSchema = extendSchema(baseSchema, {
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentResponseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  body: {
    type: String, 
    required: true
  }
});

responseSchema.virtual('time').get(function() {
  return readTime(this.body);
});
responseSchema.virtual('date').get(function() {
  return this.updated;
})
responseSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'parentResponseId'});
responseSchema.plugin(mongooseLeanVirtuals);

const Response = mongoose.model('Response', responseSchema);


articleSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'articleId'})

// const followSchema = mongoose.Schema({

// });

// const Follows = mongoose.model('Follows', followSchema)

userSchema.set('toJSON', {
  virtuals: true
});
articleSchema.set('toObject', {
  virtuals: true
});
responseSchema.set('toObject', {
  virtuals: true
});
module.exports = {
  User,
  Story,
  Article,
  Response
};