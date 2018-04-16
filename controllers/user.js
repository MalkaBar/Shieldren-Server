var db          = require('../core/db');
var validator   = require('validator'); 
var uniqid      = require('uniqid');
var crypto      = require('crypto');

module.exports = {
    insert: (user, callback) => {
        if (!user) return callback(new Error('Missing argument'), -1, null);

        if (!validator.isEmail(user.email)) return callback(new Error('Invalid email'), -1, null);
        if (!validator.isByteLength(user.first, {min: 2, max: 30})) return callback(new Error('Invalid given name'), -1, null);
        if (!validator.isByteLength(user.last, {min: 2, max: 30})) return callback(new Error('Invalid last name'), -1, null);

        user.salt = uniqid();
        var hash = crypto.createHash('sha256');
        hash.update(user.salt + validator.escape(user.password));
        user.password = hash.digest('hex');

        db.run("INSERT INTO [shieldren].[users] VALUES (" +
                "NEXT VALUE FOR shieldren.idSeq, '" + 
                user.password + "', '" + 
                validator.escape(user.email) + "', '" + 
                validator.escape(user.first) + "', '" + 
                validator.escape(user.last) + "', '" + 
                user.salt + "');",
            (err, result) => { return callback(err, result); }
        );
    }
};