var db = require('../core/db');

module.exports = {
    get: (pid, callback) => {
        if (!pid)    return callback(new Error('ERR_INVALID_INPUT'), null);

        db.run("SELECT * FROM [shieldren].[children] WHERE parentid='" + pid + "';", (err, result) => { callback(err, result); } );
        
    },
    put: (child, callback) => {
        if (!child.pid)   return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.phone) return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.name)  return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.year)  return callback(new Error('ERR_INVALID_INPUT'), null);

        db.run("INSERT INTO [shieldren].[children] VALUES (" +
                "NEXT VALUE FOR shieldren.idSeq, '" + 
                child.pid + "', '" + 
                child.name + "', '" + 
                child.phone + "', '" + 
                child.year + "', 0, 0);",
            (err, result) => {
                if (err) {
                    if (err.number == 2627) { return callback(new Error('ERR_CHILD_EXIST'), null); }
                    else {
                        return callback(err, result);
                    }
                } else {
                    return callback(err, result);
                }
            }
        );
    },
    getByChild: (childID, callback) => {
        if (!childID)    return callback(new Error('ERR_INVALID_INPUT'), null);

        db.run("SELECT * FROM shiledren.children WHERE CID = '" + chiledID + "'",
        (err, result) => {
            return callback(err, result);
        });
    },

    delete: (childID, callback) => {
        if (!childID)    return callback(new Error('ERR_INVALID_INPUT'), null);

    },
    update: (childID, callback) => {
        if (!childID)    return callback(new Error('ERR_INVALID_INPUT'), null);

    }
}