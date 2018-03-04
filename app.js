const express = require('express');
const models = require('./db');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


mongoose.connect(process.env.DBSTRING);

const urlencodedParser = bodyParser.urlencoded({
  extended: false
});

app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
// let testUID;
// models.User.findOne({username: "asdfasdf"}, (err, user) => {
//   console.log(user);
//   testUID = user._id;
// });
// console.log(testUID);
app.post('/api/users', urlencodedParser, (req, res) => {
  let newUser = new models.User({
    username: req.body.username,
    email: req.body.email,
    passwordDigest: "placeholder",
    created: Date.now(),
    updated: Date.now()
  });
  newUser.save(
    (err) => {
      if (err) {
        res.status(400).end(err.errmsg);
      } else {
        res.status(200).json(newUser);
      }
    });
});

app.post('/api/stories', urlencodedParser, (req, res) => {
  // console.log(testUser);
  let newStory = new models.Story({
    title: req.body.title,
    blurb: req.body.blurb || "",
    text: req.body.body,
    authorId: req.body.authorId,
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
  }, {"new": true}, (err, result) => {
    if (err) {
      res.status(400).end("unable to do it");
    } else {
      console.log(result);
      res.status(200).end(JSON.stringify(result));
    }
  });
})