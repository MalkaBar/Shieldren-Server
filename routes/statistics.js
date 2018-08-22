var express    = require('express');
var router     = express.Router();
var controller = require('../controllers/statisticController');
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

router.get("/last/:id/:count", (req, res, next) => {
    if (!req.params.count || req.params.count < 1) { return returnJson(res, 400, "Error","Invalid data received."); }
    if (!req.params.id || req.params.id < 1) { return returnJson(res, 400, "Error", "Invalid child number."); }

    controller.verify(req.userID, req.params.id)
        .then((child) => {
            controller.last(child.phoneNumber, req.params.count)
                .then((data) => { return returnJson(res, 200, "Success", data); })
                .catch((err) => { return returnJson(res, 500, "Internal Error", err); });
        }).catch((err) => {
            return returnJson(res, 500, "Internal Error", err);
        }); 
});

router.get("/:id/:start/:end", (req, res, next) => {
    if (!req.params.start || !req.params.end) { return returnJson(res, 400, "Error","Invalid data received."); }
    if (!req.params.id || req.params.id < 1) { return returnJson(res, 400, "Error", "Invalid child number."); }
    if (new Date(req.params.start) > new Date(req.params.end)) { return returnJson(res, 400, "Error", "Last date cannot be smaller then start date."); }
    controller.verify(req.userID, req.params.id)
        .then((child) => {
            controller.get(child.phoneNumber, req.params.start, req.params.end)
                .then((data) => { return returnJson(res, 200, "Success", data); })
                .catch((err) => { return returnJson(res, 500, "Internal Error", err); });
        }).catch((err) => {
            return returnJson(res, 500, "Internal Error", err);
        });    
});

module.exports = router;