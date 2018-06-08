var express     = require('express');
var path        = require('path');
var fs          = require('fs');
var router      = express.Router();

router.get('/', function (req, res, next) {
    res.sendFile('index.html', {root: path.join(__dirname, '../public') });
});
router.get('/favicon.ico', function (req, res, next) {
    res.sendFile('favicon.ico', { root: path.join(__dirname, '../public/src/utils')});
});
router.get('/test/empty', function (req, res, next) {
    
});
router.get('/test/:type', function (req, res, next) {
    res.sendFile(req.params.type + '.html', {root: path.join(__dirname, '../public/tests')});
});
router.get('/privacy',function(req, res, next){
    res.sendFile('privacypolicy.html', { root: path.join(__dirname, '../public') });
});
router.get('/src/utils/:img', function (req, res, next) {
    let filepath = path.join(__dirname, '../public/src/utils', req.params.img);
    if (fs.existsSync(filepath))
        res.sendFile(filepath);
    else
        res.sendStatus(404);
});
router.get('/*', function (req, res, next) {
    res.sendFile('404page.html', {root: path.join(__dirname, '../public') });
});
module.exports  = router;