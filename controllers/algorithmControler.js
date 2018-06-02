var db = require('../core/db');

module.exports = {
    save: (data,callback) => {
 //       data.message = 'N' + data.message.substring(1);
        data.group = data.group?1:0; 
        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + data.caller + "', '" + data.callee + "', '" + data.timestamp + "', '" + data.group + "', '" + data.message + "'); ",
            (err, result) => { callback(err, result); }
        );
    },
    qrBeenScaned: (cid, callback) => {
        if (!cid || cid <= 0) return callback(new Error('ERR_INVALID_INPUT'));
        db.run("UPDATE [shieldren].[children] SET qrStatus = 1 WHERE childid = '" + childID + ";",
            (err, result) => { callback(err, result); }
        );
    },
    pullChildData: (childID, callback) => {
        if (!childID) return callback(new Error('ERR_INVALID_INPUT'), null);
        db.run("SELECT * FROM [shieldren].[children] WHERE childid = " + childID + ";",
        (err, result) => {
            if (err)  { callback(err, null); }
            else{
                if (result.length == 1) { callback(null, result[0]); }
                else { callback(new Error('ERR_EMPTY_RESPONSE'), null); }
            }
        });
    }
};