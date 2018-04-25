var db = require('../core/db');

module.exports = {
    save: (data) => {
        db.run("INSERT INTO [shieldren].[messages] VALUES (" +
                "NEXT VALUE FOR shieldren.idSeq, '" + user.password + "', '" + user.email + "', '" + user.first + "', '" + user.last + "', '" + user.salt + "'); ",
            (err, result) => { /* DO NOTHING */}
        );
    }
};