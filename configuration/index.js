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
        monitor: (process.platform === 'win32') ? true : false
    },
    network: {
        port: (process.platform === 'win32') ? 3000 : 80
    },
    secret: 'Bar+Lihi+Roie+Omer+Lior',
    Script: {
        executer: (process.platform === 'win32') ? "C:/Python27/Python.exe" : "python",
        path: (process.platform === 'win32') ? "./scripts/WhatsappSelfTest.py" : "/home/project25/Documents/WhatsApp/WebWhatsapp-Wrapper-master/sample/echo.py"
    },
    Algorithm: {
        executer: (process.platform === 'win32') ? "C:/Python27/Python.exe" : "python",
        path: (process.platform === 'win32') ? "./scripts/ClassifierSelfTest.py" : "./scripts/classify.py"
    },
    Notification: {
        key: 'b7ueLfyKQPKGCbJ0HMKy9A',
        secret:'jzGV8pN9SJeq_znwo3NtGA',
        masterSecret: 'OVdkrLWTRPaHVNAhjLQTwA'
    }
};