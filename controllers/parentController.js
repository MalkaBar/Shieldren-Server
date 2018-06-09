var db          = require('../core/db');

module.exports = {
    get : (_parent) => {
        return new Promise((resolve, reject)=> {
            db.run("SELECT * FROM [shieldren].[users] WHERE id = " + _parent + ";",
            (err, result) => {
                if (err) { return reject(err); }
                else {
                    if (result.length == 1) { 
                        let user = result[0];
                        delete user.password;
                        delete user.salt;
                        return resolve(user); 
                    }
                    else { return reject(new Error("INVALID_REQUEST")); }
                }
            });
        });
    },
    getChildren: (_parent) => {
        return new Promise((resolve, reject)=> {
            db.run("SELECT * FROM [shieldren].[children] WHERE parentid = " + _parent + ";",
            (err, result) => {
                if (err) { return reject(err); }
                else {
                    if (result.length) { 
                        return resolve(result); 
                    }
                    else { return reject(new Error("INVALID_REQUEST")); }
                }
            });
        });
    },
    remove: (_parent) => {
        return new Promise((resolve, reject)=> {
            db.run("DELETE FROM [shieldren].[children] WHERE parentid = " + _parent + "; DELETE FROM [shieldren].[users] WHERE id = " + _parent + ";",
            (err, result) => {
                if (err) { return reject(err); }
                else { return resolve(null); }
            });
        });
    },
    update: (_parent, attributes) => {
        return new Promise((resolve, reject) => {
            if (attributes)
            {
                let command = "UPDATE [shieldren].[children] SET ";
                Object.keys(attributes).forEach(key => {
                    if (key != 'id')
                        command += key.toString() + " " + attributes[key] + " ";
                });
                command += "WHERE id = " + _parent + ";";

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