var db = require('../core/db');

module.exports = {
    sentenceRecieved: (data) => {
        classifier.clasiffy(data);
    },
    qrBeenScanned: (cid, callback) => {
        if (!cid || cid <= 0) return callback(new Error('ERR_INVALID_INPUT'));
        db.run("UPDATE [shieldren].[children] SET qrStatus = 1 WHERE childid = " + cid + ";",
            (err, result) => { callback(err); }
        );
    },
    qrBeenClosed: (cid) => {
        if (cid > 0)
            db.run("UPDATE [shieldren].[children] SET qrStatus = 0 WHERE childid = " + cid + ";",
                (err, result) => { }
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