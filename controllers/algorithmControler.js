var db = require('../core/db');

module.exports = {
    save: (data,callback) => {
        var parser = JSON.parse(data);
        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + parser.caller + "', '" + parser.callee + "', '" + parser.timestamp + "', '" + parser.group + "', '" + parser.message + "'); ",
            (err, result) => { callback(err, result); }
        );
    }
};