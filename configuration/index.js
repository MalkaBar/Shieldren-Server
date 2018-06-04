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
        port: (process.platform === 'win32') ? 3000 : 80
    },
    secret: 'Bar+Lihi+Roie+Omer+Lior',
    Script: {
        executer: "python",
        path: (process.platform === 'win32') ? "./scripts/ForOmer.py" : "/home/project25/Documents/WhatsApp/WebWhatsapp-Wrapper-master/sample/echo.py"
    },
    Algorithm: {
        executer: "python",
        path: "./scripts/classify.py"
    },
    Notification: {
        key: 'b7ueLfyKQPKGCbJ0HMKy9A',
        secret:'jzGV8pN9SJeq_znwo3NtGA',
        masterSecret: 'OVdkrLWTRPaHVNAhjLQTwA'
    }
};