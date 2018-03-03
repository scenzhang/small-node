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

// app.get('/api/stories/', () => {

// });

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

})