var express = require('express'),
    router = express.Router();

var someData = {
  title: 'datadtatdata',
  somethingElse: 'somethingElse'
}

router.get('/', function(req, res){
  res.render('index');
})
router.get('/chat', function(req, res){
  res.render('home', someData)
});

module.exports = router;
