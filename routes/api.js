var express        = require('express');
var userController = require('../controllers/userController');
var validator      = require('validator');
var crypto         = require('crypto');
var jwt            = require('jsonwebtoken');
var router         = express.Router();

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
        }, (err, data) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
                if (err.message === 'ERR_USER_EXIST') { returnJson(res, 409, err.message, null); }
                else { returnJson(res, 500, err.message, null); }
             }
            else {
                console.log('\033[0;32m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE BEEN ADDED');

                let uid = data[0].id;
                let token = jwt.sign({ id: uid }, require('../configuration').secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                returnJson(res, 200, "Success", {'uid': uid,  'token': token});
            }
        });
    } catch(err) {
        console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err + ']');
        returnJson(res, 500, err.message, null);
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
        userController.getByEmail(email, (err, result) => {
            //Get Error while pulling data - SQL server ERROR
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
                return returnJson(res, 400, err.message, null);;
            }

            //Get wrong answer from SQL
            if (result.length != 1) {
                console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [ERR_WRONG_QUERY]');
                return returnJson(res, 500, "Internal Error", null);
            }

            //process given password with salt
            result = result[0];
            var hash = crypto.createHash('sha256');
            hash.update(result.salt + password);
            password = hash.digest('hex');
            console.log('\033[0;33m[SERVER]\033[0m LOGIN: compare [' + result.password + '] with [' + password + ']');

            //CHECK IF PASSWORD IS WRONG
            if (result.password !== password) {
                console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
                return returnJson(res, 403, "Login Failed", null);
            }
            delete result.password;
            delete result.salt;

           let token = jwt.sign({ id: result.id }, require('../configuration').secret, {
               expiresIn: 86400 // expires in 24 hours
           });
           result.token = token;
           returnJson(res, 200, "Success", result);
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m LOGIN: ' + req.body.email + ' FAILED TO LOGIN [' + err + ']');
        return returnJson(res, 400, err.message, null);
    }
});

module.exports  = router;