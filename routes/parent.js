var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/parentController');
var validator  = require('validator');
var path       = require('path');
var jwt        = require('jsonwebtoken');


router.use(function (req, res, next) {
    try {
        jwt.verify(req.headers['x-auth-token'], require('../configuration').secret, (err, token) => {
            if (err) res.status(403).json({"status": -1, "message": "Forbidden"});
            else if (req.path.replace('/','') == token.id) next();
            else res.status(403).json({"status": -1, "message": "Forbidden"});
        });
    } catch (err) {
        res.status(403).json({"status": -1, "message": "Forbidden"});
    } 
});

//  Get parent data
router.get('/:pid', function (req, res, next) {
    controller.get(req.params.pid)
        .then((user) => {
            controller.getChildren(user.id).then((children) => {
                user['children'] = children;
                res.status(200).json(user);
            }).catch((err) => {
                res.status(200).json(user);
            });
        })
        .catch((err) => {
            res.status(500).json({ "status": -1, "message": err.message});
        })
});

router.delete('/:pid', function (req, res, next) {
    controller.remove(req.params.pid)
        .then(() => {
            res.status(200).json({"status": 0, "message": "user fully removed"});
        })
        .catch((err) => {
            res.status(500).json({ "status": -1, "message": err.message});
        })
});

router.post('/:pid', function (req, res, next) {
    try {
        let json = JSON.parse(req.body);
    
        controller.update(req.params.pid, req.body)
            .then(() => {
                res.status(200).json({"status": 0, "message": "user fully removed"});
            })
            .catch((err) => {
                res.status(500).json({ "status": -1, "message": err.message});
            });
        } catch (err) {
            res.status(400).json({ "status": -1, "message": err.message});
        }

});

module.exports = router;
