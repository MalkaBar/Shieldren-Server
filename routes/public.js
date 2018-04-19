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
/*
router.get('/test/:uid/newChild', function (req, res, next) {
    try {
        if (req.app.locals.loginUsers[req.params.uid] === req.ip)
            res.sendFile('newChild.html', {root: path.join(__dirname, '../public/tests')});
        else throw new Error('User_NOT_LOGIN');
    }
    catch (err) { res.status(403).json({'reason': err.message}); }
});
*/
router.get('/privacy',function(req, res, next){
    res.sendFile('privacypolicy.html', { root: path.join(__dirname, '../public') });
});
router.get('/*', function (req, res, next) {
    res.sendFile('404page.html', {root: path.join(__dirname, '../public') });
});
module.exports  = router;