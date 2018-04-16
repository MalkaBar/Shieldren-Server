var express     = require('express');
var path        = require('path');
var router      = express.Router();

router.get('/index', function (req, res, next) {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});
router.get('/test/:type', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public/tests/', req.params.type + '.html'));
});
router.get('/*', function (req, res, next) {
    res.sendFile('../public/404page.html');
});
module.exports  = router;
