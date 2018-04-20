
var express             = require('express');
var childController     = require('../controllers/child');
var validator           = require('validator');
var router              = express.Router();

///---------------------------------------------------------
///   Child - Get all child for parent
///
///  Method: get
///
///  Send arguments:
///     none
///
///  Callbacks (codes):
///     200 - JSON with all children
///     400 - INPUT ERRORS
///     403 - NOT LOGIN
///     500 - INTERNAL ERROR
///---------------------------------------------------------

router.get('/:pid',function(req, res, next){
    if (!req.app.locals.loginUsers[req.params.pid]) { res.sendStatus(401); }
    else {
        try {
            childController.get(parseInt(req.params.pid), (err, result) => {
                if (err)
                {
                    console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.pid + ' HAVE NOT BEEN ADDED [' + err + ']');
                    if (err.message === 'ERR_USER_EXIST') { res.status(409).json({'reason': err.message}) }
                    else { res.status(500).json({'reason': err.message}) } ;
                } else {
                    console.log('\033[0;32m[SERVER]\033[0m CHILD: GET CHILED LIST FOR ' + req.params.pid);
                    res.status(200).json(result);
                }
            });
        } catch (err) {
            console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.pid + ' HAVE NOT BEEN ADDED [' + err + ']');
            res.status(400).json({'reason': err.message});
        }
    }
});

///---------------------------------------------------------
///   Child - Insert
///
///  Method: Post
///
///  Send arguments:
///     phoneNumber - a phone number of the child
///     childName - given name of the child
///     birthdayYear - year of birth of the child
///
///  Callbacks (codes):
///     200 - OK
///     400 - INPUT ERRORS
///     403 - CHILD NOT LOGIN
///     409 - CHILD ALREADY EXIST
///     500 - INTERNAL ERROR
///---------------------------------------------------------
router.post('/:uid/insert', function (req, res, next) {
    if (!req.app.locals.loginUsers[req.params.uid]) { res.sendStatus(401); }
    else {
        try {
            if (!req.body.phoneNumber)  return new Error('ERR_INVALID_INPUT');
            if (!req.body.childName)    return new Error('ERR_INVALID_INPUT');
            if (!req.body.birthdayYear) return new Error('ERR_INVALID_INPUT');

            if (!validator.isNumeric(req.body.phoneNumber))                   throw new Error('ERR_INVAILD_PHONE');
            if (!validator.isLength(req.body.childName, {min: 2, max: 50}))   throw new Error('ERR_INVALID_NAME');
            if (!validator.isNumeric(req.body.birthdayYear))                  throw new Error('ERR_INVALID_YEAR');
            if (parseInt(req.body.birthdayYear) > (new Date()).getFullYear()) throw new Error('ERR_INVALID_YEAR');
            if (parseInt(req.body.birthdayYear) < 2000)                       throw new Error('ERR_INVALID_YEAR');

            let child = {
                pid: parseInt(req.params.uid),
                phone: validator.escape(req.body.phoneNumber),
                name: validator.escape(req.body.childName),
                year: parseInt(req.body.birthdayYear)
            }
            childController.put(child, (err, result) => {
                if (err)
                {
                    console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
                    if (err.message === 'ERR_USER_EXIST') { res.status(409).json({'reason': err.message}) }
                    else { res.status(500).json({'reason': err.message}) } ;
                } else {
                    console.log('\033[0;32m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE BEEN ADDED');
                    res.status(200).json({'reason': 'SUCCESS'});
                }
            });
        } catch (err) {
            console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
            res.status(400).json({'reason': err.message});
        }
    }
});


module.exports  = router;