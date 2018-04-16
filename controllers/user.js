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
    //callback(err, uid)
    get: (email, password, callback) => {

        if (!email)     return callback(new Error('ERR_INVALID_INPUT'), -1);
        if (!password)  return callback(new Error('ERR_INVALID_INPUT'), -1);

        db.run("SELECT * FROM [shieldren].[users] WHERE email = '" + email +"';",
        (err, result) => {
            if (err) return callback(err, result);
            if (result.length != 1) { return callback(null, -1); }
            
            var hash = crypto.createHash('sha256');
            hash.update(password + result[0].salt);
            var userPassword = hash.digest('hex');

            if (userPassword === password) return callback(null,result[0].uid);
            else return callback(null, -1);
        });

    }
    
};