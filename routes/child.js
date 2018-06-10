var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/childController');
var validator  = require('validator');
var path       = require('path');
var jwt        = require('jsonwebtoken');

router.use((req, res, next) => {
    try {
        jwt.verify(req.headers['x-auth-token'], require('../configuration').secret, (err, token) => {
            if (err) res.status(403).json({"status": 403, "message": "Forbidden"});
            else {
                req.userID = token.id.toString();
                next();
            }
        });
    } catch (err) {
        res.status(403).json({"status": 403, "message": "Forbidden"});
    } 
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
                if (err.message === 'ERR_CHILD_EXIST') { return res.status(409).json({"status": 409, "message": err.message}) }
                else { return res.status(500).json({"status": 500, "message": err.message}) } ;
            } 
            console.log('\033[0;32m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE BEEN ADDED');
            return res.status(200).json(result[0]);
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
        return res.status(400).json({"status": 400, "message": err.message});
    }
});

router.get('/:child', (req, res, next) => {
    if (!req.params.child) { return res.status(400).json({"status": 400, "message": "Bad Request"}); }
    controller.get(req.userID, req.params.child, (err, result) => {
        if (err) { return res.status(500).json({"status": 500, "message": err.message}); }
        return res.status(200).json(result[0]);
    });
});

router.delete('/:child', (req, res, next) => {
    if (!req.params.child) { return res.status(400).json({"status": 400, "message": "Bad Request"}); }
    controller.delete(req.userID, req.params.child)
        .then((result) => { return res.status(200).json({"status": 200, "message": result}); })
        .catch((err) => { return res.status(500).json({"status": 500, "message": err.message}); });
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
            res.status(500).json({ "status": -1, "message": err.message});
        });
});

module.exports = router;