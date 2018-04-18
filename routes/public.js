var express     = require('express');
var path        = require('path');
var router      = express.Router();

router.get('/', function (req, res, next) {
    res.sendFile('index.html', {root: path.join(__dirname, '../public') });
});
router.get('/favicon.ico', function (req, res, next) {
    res.sendFile('favicon.ico', { root: path.join(__dirname, '../public/src/utils')});
});
router.get('/test/:type', function (req, res, next) {
    res.sendFile(req.params.type + '.html', {root: path.join(__dirname, '../public/tests')});
});
router.get('/privacy',function(req, res, next){
    res.sendFile('privacypolicy.html', { root: path.join(__dirname, '../public') });
});
router.get('/*', function (req, res, next) {
    res.sendFile('404page.html', {root: path.join(__dirname, '../public') });
});
module.exports  = router;
