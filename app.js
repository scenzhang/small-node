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
          console.log(user)
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
  (req, res) => {
    models.User.findById(req.user.id, (err, user) => {
      res.status(200).json({
        id: user._id,
        email: user.email,
        blurb: user.blurb,
        followers: [],
        following: [],
        articles: [],
        responses: [],
        feedItems: []
      });

    })
  });

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

app.get('/api/users/:userID', urlencodedParser, (req, res) => {
  models.User.findById(userID, (err, user) => {
    res.status(200).json({
      id: user._id,
      email: user.email,
      blurb: user.blurb,
      followers: [],
      following: [],
      articles: [],
      responses: [],
      feedItems: []
    });

  })
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
    models.User.findById(req.session.passport.user, (err, user) => {
      if (user) {
      res.status(200).json({
        id: user._id,
        email: user.email,
        blurb: user.blurb,
        followers: [],
        following: [],
        articles: [],
        responses: [],
        feedItems: []
      });
    } else {
      res.status(200).json(nullUser)
    }
    })
  } else {
    res.json(nullUser);
  }
});

app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
// let testUID;
// models.User.findOne({username: "asdfasdf"}, (err, user) => {
//   console.log(user);
//   testUID = user._id;
// });
// console.log(testUID);
app.post('/api/users', urlencodedParser, (req, res) => {
  // console.log(req.body)
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
  models.Article.find({}, (err, articles) => {
    // articles.forEach((a) => console.log(a.toJSON()));
    res.json(articles);
  })
});
app.get('/api/articles/:articleID', urlencodedParser, (req, res) => {
  models.Article.findById(req.params.articleID).populate('responses').exec((err, article) => {
    console.log(article)
    models.Response.find({articleId: article.id, parentResponseId: null}).exec((err, responses) => {
      const responseList = responses.map((r) => r.id);
      aObj = article.toObject();
      aObj.response_ids = responseList;
      res.json(aObj);
    })
    // res.json(article);
  });
}); 

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
})

app.post('/api/responses', urlencodedParser, ensureAuthenticated, (req, res) => {
  console.log(req.body);
  let newResponse = new models.Response({
    authorId: req.session.passport.user,
    created: Date.now(),
    updated: Date.now(),
    body: req.body.body,
    articleId: req.body.articleId,
    parentResponseId: req.body.parentResponseId
  });
  newResponse.save((err) => {
    console.log(newResponse)
    if (err) {
      res.status(400).end("invalid field(s)");
    } else {
      res.status(200).json(newResponse);
    }
  })

})
app.get('/api/articles/:articleId/responses', urlencodedParser, (req, res) => {
  models.Response.find({articleId: req.params.articleId}, (err, responses) => {
    res.json(responses);
  })
});
app.get('/api/responses/:responseId', urlencodedParser, (req, res) => {
  models.Response.findById(req.params.responseId, (err, response) => {
    models.Response.find({parentResponseId: response.id}, (err, responses) =>{
      const respList = responses.map((r) => r.id);
      let rObj = response.toObject();
      rObj.responseList = respList;

      console.log(rObj);
      res.json(rObj);
    })
  })
})
app.post('/api/stories', urlencodedParser, ensureAuthenticated, (req, res) => {
  // console.log(testUser);
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
        // console.log(err);
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
      console.log(err);
      res.status(400).end("failed to update");
    } else {
      console.log(result);
      res.status(200).end(JSON.stringify(result));
    }
  });
})