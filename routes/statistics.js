var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/statisticController');
var jwt = require('jsonwebtoken');

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

router.get("/:id/:start/:end", (req, res, next) => {
    if (req.params.days < 1) { return returnJson(res, 400, "Error", new Error("Invalid data received.")); }
    if (req.params.id < 1) { return returnJson(res, 400, "Error", new Error("Invalid phone number.")); }
    controller.verify(req.userID, req.params.id)
        .then((child) => {
            child.phoneNumber = "0000000000";
            controller.get(child.phoneNumber, req.params.start, req.params.end)
                .then((data) => { return returnJson(res, 200, "Success", data); })
                .catch((err) => { return returnJson(res, 500, "Internal Error", err); });
        }).catch((err) => {
            return returnJson(res, 500, "Internal Error", err);
        });
    
});

module.exports = router;