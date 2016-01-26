var express = require('express'),
    router = express.Router();

var someData = {
  title: 'RIVUS',
  desc: 'Streaming chat for your business, not others.'
}

router.get('/', function(req, res){
  res.render('home', someData);
})
router.get('/chat', function(req, res){
  res.render('index');
});

module.exports = router;
