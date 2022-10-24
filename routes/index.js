var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!")

});
const pokemonsRouter = require('./pokemons.api.js')
router.use('/pokemons', pokemonsRouter)
module.exports = router;
