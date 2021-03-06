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
userSchema.pre('update', function(next) { 
  this.update({}, { $set: {updated: new Date()}});
  next();
})
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

articleSchema.pre('remove', function(next) {
  Response.remove({articleId: this._id}).exec();
  next();
})
articleSchema.pre('update', function(next) { 
  this.update({}, { $set: {updated: new Date()}});
  next();
})
responseSchema.virtual('time').get(function() {
  return readTime(this.body);
});
responseSchema.virtual('date').get(function() {
  return this.updated;
})
responseSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'parentResponseId'});
responseSchema.plugin(mongooseLeanVirtuals);

const Response = mongoose.model('Response', responseSchema);

responseSchema.pre('remove', function(next) {
  Response.find({parentResponseId: this._id}, function (err, res) {
    res.forEach(r => {
      r.remove();
    })
  });
  next();
})
responseSchema.pre('update', function(next) { 
  this.update({}, { $set: {updated: new Date()}});
  next();
})

function removeResponses(rootId) {
  Response.findById(rootId, (err, res) => {
    
  })
}

articleSchema.virtual('responses', { ref: 'Response', localField: '_id', foreignField: 'articleId'})

const followSchema = extendSchema(baseSchema, {
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})
followSchema.index({followerId: 1, followedId: 1}, {unique: true});

const Follow = mongoose.model('Follows', followSchema)

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
  Response,
  Follow
};