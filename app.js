const express = require('express');
const models = require('./db');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');
mongoose.connect(process.env.DBSTRING);
app.use(flash());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use("/public", express.static(__dirname + "/public"));


passport.use(new Strategy(
  (username, password, done) => {
    models.User.findOne({
      email: username
    }, (err, user) => {
      if (!user) {
        return done(null, false);
      }
      bcrypt.compare(password, user.passwordDigest, (err, res) => {
        if (res) {
          return done(null, {
            id: user._id,
            username: user.email
          });
        } else {
          return done(null, false);
        }
      });
    });


  }));

app.use(passport.initialize());
app.use(passport.session());

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next();
  }

  // denied. redirect to login
  res.redirect('/login')
}

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});


passport.deserializeUser(function (id, cb) {
  models.User.findById(id, (err, user) => {
    cb(err, user);
  })
});

const urlencodedParser = bodyParser.urlencoded({
  extended: false
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/application.html'));
  // res.end(`Welcome, ${req.user ?  req.user.username : 'guest'}`);
});

app.get('/blah', (req, res) => {
  res.end(`blah, ${req.session.passport.user}`);
});

app.post('/login', urlencodedParser,
  passport.authenticate('local', {
    failureRedirect: '/login'
  }),
  (req, res) => buildUser(req.user.id).then(u => res.json(u)).catch(console.log.bind(console))
);


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/login.html'));

});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.get('/new', urlencodedParser, ensureAuthenticated, (req, res) => {
  res.end(`new post by ${req.user.username}`);
})

function getUser(id) {
  return models.User.findById(id).select({
    email: 1,
    blurb: 1,
    name: 1
  }).lean();
}

function getFollows(followerId) {
  return models.Follow.find({
    followerId
  });
}

function getFollowers(followedId) {
  return models.Follow.find({
    followedId
  });
}

function buildUser(uid) {
  return Promise.all([getUser(uid), getArticles({
      authorId: uid
    }), getResponses({
      authorId: uid
    }), getFollows(uid), getFollowers(uid)])
    .then(vals => {
      u = vals[0];
      u.id = u._id;
      u.articles = vals[1];
      u.responses = vals[2];
      u.following = vals[3].map(f => f.followedId);
      u.followers = vals[4].map(f => f.followerId);
      return Promise.all([u, getArticles({
        authorId: {
          $in: u.following
        }
      })]);
    }).then(results => {
      results[0].feedItems = results[1].map(a => a._id);
      return results[0];

    })
    .catch(console.log.bind(console)); // just catch everything here
  ;


};

app.get('/api/users/:userId', urlencodedParser, (req, res) => {
  const uid = mongoose.Types.ObjectId(req.params.userId);
  buildUser(uid).then(u => res.json(u)).catch(console.log.bind(console));;
})

app.get('/api/currUser', urlencodedParser, (req, res) => {
  const nullUser = {
    id: null,
    email: null,
    blurb: null,
    followers: [],
    following: [],
    articles: [],
    responses: [],
    feedItems: []
  };
  if (req.session.passport) {
    buildUser(req.session.passport.user).then(u => res.json(u)).catch(console.log.bind(console));


  } else {
    res.json(nullUser);
  }
});

app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
app.post('/api/users', urlencodedParser, (req, res) => {
  bcrypt.hash(req.body.password, 5, (err, hash) => {
    let newUser = new models.User({
      email: req.body.email,
      passwordDigest: hash,
      blurb: req.body.blurb,
      name: req.body.name,
      created: Date.now(),
      updated: Date.now()
    });
    newUser.save(
      (err) => {
        let message;
        if (err) {
          if (err.code === 11000) {
            message = "Email taken";
          } // only email has unique constraint for users
          res.status(400).end(message);
        } else {
          res.status(200).json({
            id: newUser._id,
            email: newUser.email,
            blurb: newUser.blurb,
            followers: [],
            following: [],
            articles: [],
            responses: [],
            feedItems: []
          });
        }
      });

  })
});
app.get('/api/articles', urlencodedParser, (req, res) => {
  models.Article.find({}).populate('authorId').lean({
    virtuals: true
  }).exec((err, articles) => {
    if (err) {
      console.log(err)
    } else {
      articles.forEach((_, i, as) => {
        as[i].author = as[i].authorId.name;
        as[i].authorId = as[i].authorId._id;
      });
      res.json(articles);
    }
  })
});


// app.get('/api/articles/:articleID', urlencodedParser, (req, res) => {

//   models.Article.findById(req.params.articleID).populate('responses').exec((err, article) => {
//     models.Response.find({
//       articleId: article.id,
//       parentResponseId: null
//     }).exec((err, responses) => {
//       const responseList = responses.map((r) => r.id);
//       aObj = article.toObject();
//       aObj.response_ids = responseList;
//       res.json(aObj);
//     })
//     // res.json(article);
//   });
// });

app.post('/api/articles', urlencodedParser, ensureAuthenticated, (req, res) => {
  let newArticle = new models.Article({
    title: req.body.title,
    description: req.body.blurb,
    body: req.body.body,
    authorId: req.session.passport.user,
    created: Date.now(),
    updated: Date.now()

  });
  newArticle.save((err) => {
    if (err) {
      res.status(400).end("invalid field(s)");
    } else {
      res.status(200).json(newArticle);
    }

  })
});

app.delete('/api/articles/:articleId', urlencodedParser, ensureAuthenticated, (req, res) => {
  models.Article.findOne({
    _id: mongoose.Types.ObjectId(req.params.articleId)
  }, (err, doc) => {
    doc.remove();
    res.json(doc);

  });
});

app.delete('/api/responses/:responseId', urlencodedParser, ensureAuthenticated, (req, res) => {
  models.Response.findOne({
    _id: mongoose.Types.ObjectId(req.params.responseId)
  }, (err, doc) => {
    doc.remove();
    res.json(doc);
  })
})
app.post('/api/responses', urlencodedParser, ensureAuthenticated, (req, res) => {
  let newResponse = new models.Response({
    authorId: req.session.passport.user,
    created: Date.now(),
    updated: Date.now(),
    body: req.body.body,
    articleId: req.body.articleId,
    parentResponseId: req.body.parentResponseId,
  });
  newResponse.save((err) => {
    if (err) {
      console.log(err);
      res.status(400).end("invalid field(s)");
    } else {
      rObj = newResponse.toObject();
      rObj.response_ids = [];
      res.status(200).json(rObj);
    }
  })

})

app.get('/api/articles/:articleId', urlencodedParser, (req, res) => {
  getArticles({
    _id: mongoose.Types.ObjectId(req.params.articleId)
  }).exec(function (err, result) {
    if (err) {
      return console.log(err);
    } else {
      return res.json(result[0]);
    }
  })
})

function getResponses(param) {
  return models.Response.aggregate([{
      $match: param
    },
    {
      $lookup: {
        from: "responses",
        localField: "_id",
        foreignField: "parentResponseId",
        as: "response_ids"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $unwind: "$author"
    },
    {
      $project: {
        id: "$_id",
        date: "$updated",
        body: 1,
        articleId: 1,
        authorId: 1,
        parentResponseId: 1,
        time: {
          $divide: [{
            $size: {
              $split: ["$body", " "]
            }
          }, 200]
        },
        response_ids: "$response_ids._id",
        author: "$author.name"

      }

    }
  ])
}

function getArticles(param) {
  return models.Article.aggregate([{
      $match: param
    },

    {
      $lookup: {
        from: "responses",
        localField: "_id",
        foreignField: "articleId",
        as: "response_ids"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $unwind: "$author"
    },
    {
      $project: {
        id: "$_id",
        title: 1,
        description: 1,
        body: 1,
        authorId: 1,
        date: "$updated",
        time: {
          $divide: [{
            $size: {
              $split: ["$body", " "]
            }
          }, 200]
        },
        response_ids: "$response_ids._id",
        author: "$author.name"
      }
    }
  ])
}
app.get('/api/articles/:articleId/responses', urlencodedParser, (req, res) => {
  getResponses({
      articleId: mongoose.Types.ObjectId(req.params.articleId)
    })
    .exec((err, result) => {
      return res.json(result);
    })
})
app.get('/api/articles/:articleId/responsesOld', urlencodedParser, (req, res) => {
  let rs = [];
  models.Response.find({
    articleId: req.params.articleId
  }).populate("authorId").exec((err, responses) => {
    responses.forEach(r => {
      models.Response.find({
        parentResponseId: r.id
      }, (err, replies) => {
        let rObj = r.toObject();
        rObj.response_ids = replies.map(resp => resp.id);
        rObj.author = rObj.authorId.name;
        delete rObj.authorId;
        rs.push(rObj);

        if (rs.length === responses.length) {
          res.json(rs);
        }
      })
    })


  });
})

app.get('/api/responses/:responseId', urlencodedParser, (req, res) => {
  getResponses({
    _id: mongoose.Types.ObjectId(req.params.responseId)
  }).exec((err, result) => {
    return res.json(result[0]);
  })
})
app.get('/api/old/responses/:responseId', urlencodedParser, (req, res) => {
  models.Response.findById(req.params.responseId, (err, response) => {
    models.Response.find({
      parentResponseId: response.id
    }, (err, responses) => {
      const respList = responses.map((r) => r.id);
      let rObj = response.toObject();
      rObj.response_ids = respList;

      res.json(rObj);
    })
  })
})
app.patch('/api/articles/:articleId', urlencodedParser, (req, res) => {
  console.log(req.body);
  models.Article.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.articleId), {
    $set: req.body
  }, {
    new: true
  }, (err, doc) => {
    console.log(doc);
    res.json(doc);
  })
})
app.patch('/api/responses/:responseId', urlencodedParser, (req, res) => {
  console.log(req.body);
  models.Response.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.responseId), {
    $set: req.body
  }, {
    new: true
  }, (err, doc) => {
    console.log(doc);
    res.json(doc);
  })
})

app.get('/api/follows', urlencodedParser, (req, res) => {
  console.log(req.query);
});

app.post('/api/follows', urlencodedParser, (req, res) => {
  console.log(req.body);
  let newFollow = new models.Follow({
    followerId: req.body.followerId,
    followedId: req.body.followedId
  });
  newFollow.save((err) => {
    if (err) {
      res.status(400)
    } else {
      res.json(newFollow);
    }
  })
});

app.delete('/api/follows', urlencodedParser, (req, res) => {
  console.log(req.query);
  let followedId, followerId;
  ({
    followedId,
    followerId
  } = req.query);
  console.log(followedId);
  // console.log(followerId);
  models.Follow.remove({
    followedId,
    followerId
  }, (err) => {
    if (err) res.end(err);
    res.json({
      followerId,
      followedId
    });
    fee
  })
});

app.get('/api/responses/:responseId/replies', urlencodedParser, (req, res) => {
  getResponses({
      parentResponseId: mongoose.Types.ObjectId(req.params.responseId)
    })
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    })
})
app.get('/api/old/responses/:responseId/replies', urlencodedParser, (req, res) => {
  let rs = [];
  models.Response.find({
    parentResponseId: req.params.responseId
  }, (err, responses) => {
    if (responses.length === 0) res.json([]);
    responses.forEach(r => {
      models.Response.find({
        parentResponseId: r.id
      }, (err, replies) => {
        let rObj = r.toObject();
        rObj.response_ids = replies.map(resp => resp.id);
        rs.push(rObj);
        if (rs.length === responses.length) {
          res.json(rs)
        };
      })
    })
  })
})

app.post('/api/stories', urlencodedParser, ensureAuthenticated, (req, res) => {
  let newStory = new models.Story({
    title: req.body.title,
    blurb: req.body.blurb || "",
    text: req.body.body,
    authorId: req.user.id,
    created: Date.now(),
    updated: Date.now(),
    type: req.body.type
  });
  newStory.save(
    (err) => {
      if (err) {
        res.status(400).end("invalid field(s)");

      } else {
        res.status(200).json(newStory);
      }
    });
});

app.put('/api/stories/:storyID', urlencodedParser, (req, res) => {
  const sid = req.params.storyID;
  const {
    title,
    blurb,
    text
  } = req.body;
  models.Story.findByIdAndUpdate(sid, {
    title,
    blurb,
    text,
    updated: Date.now()
  }, {
    "new": true
  }, (err, result) => {
    if (err || !result) {
      res.status(400).end("failed to update");
    } else {
      res.status(200).end(JSON.stringify(result));
    }
  });
})