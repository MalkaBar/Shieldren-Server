var express             = require('express');
var path                = require('path');
var userController      = require('../controllers/user');
var validator           = require('validator');
var router              = express.Router();

/*---------------------------------------------------------
    Register new user

    Method: Post

    Send arguments:
        email - string
        first - string (given name)
        last - string (family name)
        password - string

    Callbacks (codes):
        200 - OK
        500 - INTERNAL ERROR
        1001 - ERR_INVALID_INPUT
        2627 - ERR_ALREADY_EXIST
---------------------------------------------------------*/
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

        //  Try to insert new user
        userController.put({
            email:      validator.escape(req.body.email),
            first:      validator.escape(req.body.first),
            last:       validator.escape(req.body.last),
            password:   validator.escape(req.body.password)
        }, (err, count, rows) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
                res.status(500).send(err.message);
             }
            else {
                console.log('\033[0;32m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE BEEN ADDED');
                res.send('SUCCESS');
            }
        });
    } catch(err) {
        console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
        res.status(400).send(err.message);
    }
});

router.post('/login', function (req, res, next) {
    try {
        //  Check if all required arguments are sent
        if (!req.body.email)    throw Error('ERR_INVALID_INPUT');
        if (!req.body.password) throw Error('ERR_INVALID_INPUT');

        //  Check if all arguments are valids
        if (!validator.isEmail(req.body.email)) throw new Error('ERR_INVAILD_EMAIL');

        var email    = validator.escape(req.body.email);
        var password = validator.escape(req.body.password);

        //  Get user password and salt, and compare with the password given by the user
        userController.get(email, password, (err, uid) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
                res.status(500).send(err.message);
            } else {
                if (uid > 0) { res.status(200).json({'uid': uid}); }
                else { res.sendStatus(403); }
            }
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
        res.status(400).send(err.message);
    }
});
module.exports  = router;