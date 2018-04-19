var express             = require('express');
var path                = require('path');
var userController      = require('../controllers/user');
var childController     = require('../controllers/child');
var validator           = require('validator');
var router              = express.Router();

///---------------------------------------------------------
///  Register new user
///
///  Method: Post
///
///  Send arguments:
///      email - string
///      first - string (given name)
///      last - string (family name)
///      password - sha256(string)
///
///  Callbacks (codes):
///      200 - OK
///      400 - USER ERRORS
///      409 - ERR_USER_EXIST
///      500 - INTERNAL ERROR
///-----------------------------------------------------------
router.post('/register', function (req, res, next) {
    try { 
        //  Check if all required arguments are sent
        if (!req.body.email)    throw Error('ERR_INVALID_INPUT');
        if (!req.body.first)    throw Error('ERR_INVALID_INPUT');
        if (!req.body.last)     throw Error('ERR_INVALID_INPUT');
        if (!req.body.password) throw Error('ERR_INVALID_INPUT');

        //  Check if all arguments are valids
        if (!validator.isEmail(req.body.email))                         throw new Error('ERR_INVAILD_EMAIL');
        if (!validator.isByteLength(req.body.first, {min: 2, max: 30})) throw new Error('ERR_INVALID_FIRST');
        if (!validator.isByteLength(req.body.last, {min: 2, max: 30}))  throw new Error('ERR_INVALID_LAST');
        if (req.body.password.length != 64)                             throw new Error('ERR_PASSWROD_FORMAT');

        //  Try to insert new user
        userController.put({
            email:      validator.escape(req.body.email),
            first:      validator.escape(req.body.first),
            last:       validator.escape(req.body.last),
            password:   req.body.password
        }, (err, count, rows) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
                if (err.message === 'ERR_USER_EXIST') { res.status(409).json({'reason': err.message}) }
                else { res.status(500).json({'reason': err.message}) } ;
             }
            else {
                console.log('\033[0;32m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE BEEN ADDED');
                res.status(200).json({'reason': 'SUCCESS'});
            }
        });
    } catch(err) {
        console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
        res.status(400).json({'reason': err.message});
    }
});

/*/---------------------------------------------------------
///   Login user
///
///  Method: Post
///
///  Send arguments:
///      email - string
///      password - sha256(string)
///
///  Callbacks (codes):
///      200 - OK
///      400 - USER ERRORS
///      403 - FORBIDDEN LOGIN
///      500 - INTERNAL ERROR
///-------------------------------------------------------/*/
router.post('/login', function (req, res, next) {
    try {
        //  Check if all required arguments are sent
        if (!req.body.email)    throw Error('ERR_INVALID_INPUT');
        if (!req.body.password) throw Error('ERR_INVALID_INPUT');
        console.log('PASSWORD: ' + req.body.password);
        //  Check if all arguments are valids
        if (!validator.isEmail(req.body.email)) throw new Error('ERR_INVAILD_EMAIL');
        if (req.body.password.length != 64)     throw new Error('ERR_PASSWROD_FORMAT');

        var email    = validator.escape(req.body.email);
        var password = validator.escape(req.body.password);

        //  Get user password and salt, and compare with the password given by the user
        userController.get(email, password, (err, uid) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
                res.sendStatus(403);
            } else {
                if (uid > 0) {
                    var date = new Date();
                    req.app.locals.loginUsers[uid] = date.setTime(date.getTime() + 1);
                    res.status(200).json({'uid': uid});
                }
                else { res.sendStatus(403); }
            }
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
        res.status(400).json({'reason': err.message});
    }
});

///---------------------------------------------------------
///   Child - Get all child for parent
///
///  Method: get
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
router.get('/child/:uid', function (req, res, next) {
    if (!req.app.locals.loginUsers[req.params.uid]) { res.sendStatus(401); }
    else {
        try {
            childController.put(parseInt(req.params.uid), (err, result) => {
                if (err)
                {
                    console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.uid + ' HAVE NOT BEEN ADDED [' + err + ']');
                    if (err.message === 'ERR_USER_EXIST') { res.status(409).json({'reason': err.message}) }
                    else { res.status(500).json({'reason': err.message}) } ;
                } else {
                    console.log('\033[0;32m[SERVER]\033[0m CHILD: GET CHILED LIST FOR ' + req.params.uid);
                    res.status(200).json(result);
                }
            });
        } catch (err) {
            console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.uid + ' HAVE NOT BEEN ADDED [' + err + ']');
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
router.post('/child/:uid/insert', function (req, res, next) {
    if (!req.app.locals.loginUsers[req.params.uid]) { res.sendStatus(401); }
    else {
        try {
            if (!req.body.phoneNumber) return callback(new Error('ERR_INVALID_INPUT'), null);
            if (!req.body.childName)   return callback(new Error('ERR_INVALID_INPUT'), null);
            if (!req.body.birthdayYear)    return callback(new Error('ERR_INVALID_INPUT'), null);

            if (!validator.isNumeric(req.body.phoneNumber))                 throw new Error('ERR_INVAILD_PHONE');
            if (!validator.isLength(req.body.childName, {min: 2, max: 50})) throw new Error('ERR_INVALID_NAME');
            if (!validator.isNumeric(req.body.birthdayYear))                    throw new Error('ERR_INVALID_YEAR');
            if (parseInt(req.body.birthdayYear) > (new Date()).getFullYear())   throw new Error('ERR_INVALID_YEAR');
            if (parseInt(req.body.birthdayYear) < 2000)                         throw new Error('ERR_INVALID_YEAR');

            let child = {
                pid: parseInt(req.params.uid),
                phone: validator.escape(req.body.phoneNumber),
                name: validator.escape(req.body.childName),
                year: parseInt(req.body.birthday)
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