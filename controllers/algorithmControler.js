var db = require('../core/db');

module.exports = {
    save: (data,callback) => {
 //       data.message = 'N' + data.message.substring(1);
        data.group = data.group?1:0; 
        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + data.caller + "', '" + data.callee + "', '" + data.timestamp + "', '" + data.group + "', '" + data.message + "'); ",
            (err, result) => { callback(err, result); }
        );
    }
};