var express = require('express'),
    router = express.Router();

var someData = {
  title: 'RIVUS',
  desc: 'Anonymous chat, an endless stream of communication at your fingertips.'
}

router.get('/', function(req, res){
  res.render('home', someData);
})
router.get('/chat', function(req, res){
  res.render('index');
});

module.exports = router;
