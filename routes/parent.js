var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/parentController');
var validator  = require('validator');
var jwt        = require('jsonwebtoken');
var identifier = require('unique-string');
var crypto      = require('crypto');

router.use(function (req, res, next) {
    try {
        jwt.verify(req.headers['x-auth-token'], require('../configuration').secret, (err, token) => {
            if (err) {
                returnJson(res, 403, "Forbidden", null);
            }
            else {
                req.userID = token.id.toString();
                next();
            }
        });
    } catch (err) {
        returnJson(res, 403, "Forbidden", null);
    } 
});

router.get('/:pid', function (req, res, next) {
    if (req.userID !== req.params.pid) { return res.status(403).json({"status": -1, "message": "Forbidden"}); } 
    controller.get(req.params.pid)
        .then((user) => {
            controller.getChildren(user.id).then((children) => {
                user['children'] = children;
                returnJson(res, 200, null, user);
            }).catch((err) => {
                returnJson(res, 200, null, user);
            });
        })
        .catch((err) => {
            returnJson(res, 500, err.message, null);
        })
});

router.delete('/:pid', function (req, res, next) {
    if (req.userID !== req.params.pid) { return res.status(403).json({"status": -1, "message": "Forbidden"}); } 
    controller.remove(req.params.pid)
        .then(() => {
            res.status(200).json({"status": 0, "message": "user fully removed"});
        })
        .catch((err) => {
            res.status(500).json({ "status": -1, "message": err.message});
        })
});

router.put('/:pid', function (req, res, next) {
    if (req.userID !== req.params.pid) { return res.status(403).json({"status": -1, "message": "Forbidden"}); } 
    let attributes = {}
    if (req.body.email)
    {
        if (!validator.isEmail(req.body.email)) throw new Error('ERR_INVAILD_EMAIL');
        else attributes['email'] = validator.escape(req.body.email);
    }
    if (req.body.firstName) {
        if (!validator.isLength(req.body.firstName, {min: 2, max: 50})) throw new Error('ERR_INVALID_FIRSTNAME');
        else attributes['firstName'] = validator.escape(req.body.firstName);
    }
    if (req.body.lastName) {
        if (!validator.isLength(req.body.lastName, {min: 2, max: 50})) throw new Error('ERR_INVALID_LASTNAME');
        else attributes['lastName'] = validator.escape(req.body.lastName);
    }
    if (req.body.password) {
        if (req.body.password.length != 64) throw new Error('ERR_PASSWROD_FORMAT');
        else {
            attributes['salt'] = identifier();
            attributes['password'] = validator.escape(req.body.password);

            let hash = crypto.createHash('sha256');
            hash.update(attributes['salt'] + attributes['password']);
            attributes['password'] = hash.digest('hex');
        }
    }
    controller.update(req.params.pid, attributes)
        .then(() => {
            controller.get(req.params.pid)
                .then((user) => {
                    returnJson(res,200,"Success",user);
                }).catch((err) => {
                    returnJson(res, 500, err.message, null);
                });
        })
        .catch((err) => {
            returnJson(res, 500, err.message, null);
        });
});

module.exports = router;
