var db = require("../core/db");

function Statistics () {}

Statistics.prototype.verify = (_parentID, _childID) => {
    return new Promise((resolve, reject) => {
        if (!_parentID || !_childID) {
            reject(new Error("Missing Arguments"));
        } else {
            db.run("SELECT * FROM [shieldren].[children] WHERE parentid = '" + _parentID + "' and childid = '" + _childID + "';", (err, data) => {
                if (err) {
                    reject(new Error("Child not found"));
                    return;
                } else {
                    if (data.length == 1) resolve(data[0]);
                    else reject(new Error("Child not found"));
                }
            });
        }
    });
}

Statistics.prototype.get = function (_requestedPeriod, _childReceiverPhone) {
    return new Promise(function(resolve, reject) {
        db.run("SELECT timestamp, count(*) as 'count' FROM [shieldren].[messages] WHERE reciever = '" + _childReceiverPhone + "' GROUP BY timestamp;", function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

module.exports = new Statistics;