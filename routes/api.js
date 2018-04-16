var express             = require('express');
var path                = require('path');
var userController      = require('../controllers/user');
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
        
        if (!req.body.email)    throw Error('Missing email address');
        if (!req.body.first)    throw Error('Missing given name');
        if (!req.body.last)     throw Error('Missing last name');
        if (!req.body.password) throw Error('Missing password');

        userController.insert({
            email: req.body.email,
            first: req.body.first,
            last: req.body.last,
            password: req.body.password
        }, (err, count, rows) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE NOT BEEN ADDED [' + err.message + ']');
                res.status(500).send(err);
             }
            else {
                console.log('\033[0;32m[SERVER]\033[0m REGISTER: ' + req.body.email + ' HAVE BEEN ADDED');
                res.send('DONE');
            }
        });
    } catch(err) {
        res.status(500).send(err);
    }
});


module.exports  = router;