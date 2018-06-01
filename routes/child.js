
var express             = require('express');
var childController     = require('../controllers/childController');
var validator           = require('validator');
var router              = express.Router();
var path                = require('path');
var jwt                 = require('jsonwebtoken');

///---------------------------------------------------------
///   Child - Get all child for parent
///
///  Method: get
///
///  Send arguments:
///     none
///
///  Callbacks (codes):
///     200 - JSON with all children
///     400 - INPUT ERRORS
///     403 - NOT LOGIN
///     500 - INTERNAL ERROR
///---------------------------------------------------------

router.get('/:pid',function(req, res, next){
    if (!authVerify(req)) { res.sendStatus(403); }
    else {
        try {
            childController.get(parseInt(req.params.pid), (err, result) => {
                if (err)
                {
                    console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.pid + ' [' + err + ']');
                    if (err.message === 'ERR_USER_EXIST') { res.status(409).json({'reason': err.message}) }
                    else { res.status(500).json({'reason': err.message}) } ;
                } else {
                    console.log('\033[0;32m[SERVER]\033[0m CHILD: GET CHILED LIST FOR ' + req.params.pid);
                    res.status(200).json(result);
                }
            });
        } catch (err) {
            console.log('\033[0;31m[SERVER]\033[0m CHILD: CANT GET CHILD LIST FOR ' + req.params.pid + ' HAVE NOT BEEN ADDED [' + err + ']');
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
///     403 - USER NOT LOGIN
///     409 - CHILD ALREADY EXIST
///     500 - INTERNAL ERROR
///---------------------------------------------------------
router.post('/:pid', function (req, res, next) {
    if (!authVerify(req)) { return res.sendStatus(403); }
    else {
        try {
            if (!req.body.phoneNumber)  throw new Error('ERR_MISSING_PHONE');
            if (!req.body.childName)    throw new Error('ERR_MISSING_NAME');
            if (!req.body.birthdayYear) throw new Error('ERR_MISSING_YEAR');

            var child = {
                'pid': req.params.pid,
                'phone': req.body.phoneNumber.toString(),
                'name': req.body.childName.toString(),
                'year': Number(req.body.birthdayYear)
            }

            if (!validator.isMobilePhone(child.phone, 'he-IL'))     throw new Error('ERR_INVAILD_PHONE');
            if (!validator.isLength(child.name, {min: 2, max: 50})) throw new Error('ERR_INVALID_NAME');
            if (child.year === 'NaN')                               throw new Error('ERR_INVALID_FORMAT');
            if (child.year > (new Date()).getFullYear() || child.year < 2000)   throw new Error('ERR_INVALID_YEAR');

            childController.put(child, (err, result) => {
                if (err)
                {
                    console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
                    if (err.message === 'ERR_CHILD_EXIST') { return res.status(409).json({'reason': err.message}) }
                    else { return res.status(500).json({'reason': err.message}) } ;
                } 
                console.log('\033[0;32m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE BEEN ADDED');
                return res.status(200).json(result[0]);
            });
        } catch (err) {
            console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.body.childName + ' HAVE NOT BEEN ADDED [' + err + ']');
            return res.status(400).json({'reason': err.message});
        }
    }
});

///---------------------------------------------------------
///   Child - Get child by cid
///
///  Method: Get
///  URL: /[parentid]/[childid]
///
///  Send arguments:
///     none
///
///  Callbacks (codes):
///     200 - OK
///     400 - INPUT ERRORS
///     403 - USER NOT LOGIN
///     500 - INTERNAL ERROR
///---------------------------------------------------------
router.get('/:pid/:cid', function (req, res, next) {
    if (authVerify(req)) { return res.sendStatus(403); }
    try {
        if (!validator.isNumeric(req.params.cid)) throw new Error('ERR_INVAILD_CID');
        childController.getByChild(req.params.pid, req.params.cid, (err, result) => {
            if (err) {
                console.log('\033[0;31m[SERVER]\033[0m CHILD: ' + req.params.cid + ' NOT EXIST [' + err + ']');
                return res.status(500).json({'reason': err.message});
            }
            console.log('\033[0;32m[SERVER]\033[0m CHILD: GET CHILED LIST FOR ' + req.params.cid);
            return res.status(200).json(result[0]);
        });
    } catch (err) {
        console.log('\033[0;31m[SERVER]\033[0m ERROR FIND CHILD ' + req.params.cid + ' [' + err + ']');
        res.status(400).json({'reason': err.message});
    }
});



function authVerify(req)
{
    let token = req.headers['x-auth-token'];
    let pid = req.params.pid;

    if (!token || !pid) return false;

    try {
        let result = jwt.verify(token, require('../configuration').secret);
        if (result.id == pid) return true;
        return false;
    }
    catch (err) { return false; } 
}

module.exports = router;