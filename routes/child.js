var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/childController');
var validator  = require('validator');
var path       = require('path');
var jwt        = require('jsonwebtoken');

router.use((req, res, next) => {
    try {
        jwt.verify(req.headers['x-auth-token'], require('../configuration').secret, (err, token) => {
            if (err) returnJson(res, 403, "Forbidden", null);
            else {
                req.userID = token.id.toString();
                next();
            }
        });
    } catch (err) { if (err) returnJson(res, 403, "Forbidden", null); } 
});

router.post('/', (req, res, next) => {
    try {
        if (!req.body.phoneNumber)  throw new Error('ERR_MISSING_PHONE');
        if (!req.body.childName)    throw new Error('ERR_MISSING_NAME');
        if (!req.body.birthdayYear) throw new Error('ERR_MISSING_YEAR');

        var child = {
            'pid': req.userID,
            'phone': req.body.phoneNumber.toString(),
            'name': req.body.childName.toString(),
            'year': Number(req.body.birthdayYear)
        }

        if (!validator.isMobilePhone(child.phone, 'he-IL'))               throw new Error('ERR_INVAILD_PHONE');
        if (!validator.isLength(child.name, {min: 2, max: 50}))           throw new Error('ERR_INVALID_NAME');
        if (child.year === 'NaN')                                         throw new Error('ERR_INVALID_FORMAT');
        if (child.year > (new Date()).getFullYear() || child.year < 2000) throw new Error('ERR_INVALID_YEAR');

        controller.post(child, (err, result) => {
            if (err)
            {
                console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
                if (err.message === 'ERR_CHILD_EXIST') { return returnJson(res, 409, err.message, null); }
                else { return returnJson(res, 500, err.message, null); } ;
            } 
            console.log('\033[0;32m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE BEEN ADDED');
            return returnJson(res, 200, "Success", result[0]);
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
        return returnJson(res, 500, err.message, null);
    }
});

router.get('/:child', (req, res, next) => {
    if (!req.params.child) { return returnJson(res, 400, "Bad Request", null); }
    controller.get(req.userID, req.params.child, (err, result) => {
        if (err) { return returnJson(res, 500, err.message, null); }
        return returnJson(res, 200, "Success", result[0]);
    });
});

router.delete('/:child', (req, res, next) => {
    if (!req.params.child) { return returnJson(res, 400, "Bad Request", null); }
    controller.delete(req.userID, req.params.child)
        .then((result) => { return returnJson(res, 200, "Success", result); })
        .catch((err) => { return returnJson(res, 500, err.message, null); });
});

router.put('/:child', (req, res, next) => {
    let attributes = {};
    if (req.body.phoneNumber)
    {
        if (!validator.isMobilePhone(req.body.phoneNumber, 'he-IL')) throw new Error('ERR_INVAILD_PHONE');
        else attributes['phoneNumber'] = req.body.phoneNumber;
    }
    if (req.body.childName) {
        if (!validator.isLength(req.body.childName, {min: 2, max: 50})) throw new Error('ERR_INVALID_NAME');
        else attributes['displayName'] = req.body.childName;
    }
    if (req.body.birthdayYear) {
        if (req.body.birthdayYear > (new Date()).getFullYear() || req.body.birthdayYear < 2000) throw new Error('ERR_INVALID_YEAR');
        else attributes['yearOfBirth'] = req.body.birthdayYear;
    }

    controller.update(req.userID, req.params.child, attributes)
        .then(() => {
            controller.get(req.userID, req.params.child, (err, result) => {
                if (err) { return res.status(500).json({"status": 500, "message": err.message}); }
                return res.status(200).json(result[0]);
            });
        })
        .catch((err) => {
            returnJson(res, 500, err.message, null);
        });
});

module.exports = router;