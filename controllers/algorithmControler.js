var db = require('../core/db');

module.exports = {
    save: (data,callback) => {
        var parser = JSON.parse(data);
        parser.message = 'N' + parser.message.substring(1);
        parser.timestamp = Date.parse(parser.timestamp);
        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + parser.caller + "', '" + parser.callee + "', '" + parser.timestamp + "', '" + parser.group + "', " + parser.message + "); ",
            (err, result) => { callback(err, result); }
        );
    }
};