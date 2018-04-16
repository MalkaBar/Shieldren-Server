var db          = require('../core/db');
var uniqid      = require('uniqid');
var crypto      = require('crypto');

module.exports = {
    put: (user, callback) => {
        if (!user) return callback(new Error('ERR_INVALID_INPUT'), null);

        user.salt = uniqid();
        var hash = crypto.createHash('sha256');
        hash.update(user.salt + user.password);
        user.password = hash.digest('hex');

        db.run("INSERT INTO [shieldren].[users] VALUES (" +
                "NEXT VALUE FOR shieldren.idSeq, '" + 
                user.password + "', '" + 
                user.email + "', '" + 
                user.first + "', '" + 
                user.last + "', '" + 
                user.salt + "');",
            (err, result) => {
                if (err) {
                    if (err.number == 2627) { return callback(new Error('ERR_USER_EXIST'), null); }
                    else {
                        return callback(err, result);
                    }
                } else {
                    return callback(err, result);
                }
            }
        );
    },
    get: (email, password, callback) => {

    }
    
};