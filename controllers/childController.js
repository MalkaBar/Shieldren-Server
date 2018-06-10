var db = require('../core/db');

module.exports = {
    get: (parent, child, callback) => {
        if (!child)    return callback(new Error('ERR_INVALID_INPUT'), null);
        db.run("SELECT * FROM [shieldren].[children] WHERE childid = '" + child + "' AND parentid = '" + parent + "';",
        (err, result) => {
            return callback(err, result);
        });
    },
    post: (child, callback) => {
        if (!child.pid)   return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.phone) return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.name)  return callback(new Error('ERR_INVALID_INPUT'), null);
        if (!child.year)  return callback(new Error('ERR_INVALID_INPUT'), null);

        db.run("INSERT INTO [shieldren].[children] VALUES (" +
               "NEXT VALUE FOR shieldren.idSeq, '" + child.pid + "', '" + child.name + "', '" + child.phone + "', '" + child.year + "', 0, 0); " +
               "SELECT childid FROM [shieldren].[children] WHERE parentid = " + child.pid + " AND displayName = '" + child.name + "';",
            (err, result) => {
                if (err) {
                    if (err.number == 2627) { return callback(new Error('ERR_CHILD_EXIST'), null); }
                    return callback(err, result);
                }
                return callback(err, result);
            }
        );
    },
    delete: (parent, child) => {
        if (!child)  return callback(new Error('ERR_INVALID_INPUT'), null);
        return promise = new Promise((resolve, reject) => {
            db.run("DELETE FROM [shieldren].[children] WHERE parentid = " + parent + " AND  childid = " + child + ";",
            (err, result) => {
                if (err) return reject(err);
                else resolve(result);
            });
        });
    },
    update: (parent, child, attributes) => {
        return new Promise((resolve, reject) => {
            if (attributes)
            {
                let command = "UPDATE [shieldren].[children] SET ";
                Object.keys(attributes).forEach(key => {
                        command += key.toString() + " = '" + attributes[key] + "', ";
                });
                command = command.slice(0, -2) + " WHERE parentid = " + parent + " AND childid = " + child + ";";

                db.run(command.toString(), (err, result) => {
                    if (err) { return reject(err); }
                    else { return resolve(null); }
                });
            }
            else {
                reject(new Error('INVALID_REQUEST'));
            }
        });    
    }
}