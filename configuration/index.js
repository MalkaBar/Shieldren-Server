module.exports = {
    db: {
        config: {
            server: 'db.cs.colman.ac.il',
            port: 1433,
            userName: 'shieldren',
            password: 'shield@2018',
            options: {
                database: 'shieldren',
                encrypt: false
            }
        },
        monitor: true
    },
    network: {
        port: 80
    }
};