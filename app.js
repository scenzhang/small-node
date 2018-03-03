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
  console.log(req);
    models.User.create({
      username: req.body.username,
      email: req.body.email,
      passwordDigest: "placeholder",
      created: Date.now(),
      updated: Date.now()
    },
    (err, user) => {
      if (err) {
        // console.log(err);
        res.status(400).end('invalid');
      } else {
        res.status(200).end('user created');
      }
    });
});