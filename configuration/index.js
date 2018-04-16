module.exports = {
    dbConfig: {
        server: 'db.cs.colman.ac.il',
        port: 1433,
        userName: 'shieldren',
        password: 'shield@2018',
        options: {
            database: 'shieldren',
            encrypt: false,
            debug: {
                packet: false,
                data: false,
                payload: false,
                token: false,
                log: true
              }
        }
    },
    Port: 3333,
    debug: true
};