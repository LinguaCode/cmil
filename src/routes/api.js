var express = require('express');
var geo = require('geotools');
var router = express.Router();

var commands = require('../core/modifier/commands');
var database = require('../database/connection');

router
  .get('/ip', function (req, res) {
    var geolookup = geo.lookup(req.connection.remoteAddress);
    res.send(geolookup);
  })

  .get('/translations', function (req, res) {
    res.send(database.translations);
  })

  .get('/commands/:language', function (req, res) {
    var language = req.params.language;
    res.send(commands.groupAllTranslations(language));
  })

  .post('/tutorials', function (req, res) {
    res.send(database.tutorials);
  });

module.exports = router;
