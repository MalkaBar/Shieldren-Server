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
    },
    secret: 'Bar+Lihi+Roie+Omer+Lior',
    Script: {
        executer: "python",
        path: "/home/project25/Documents/WhatsApp/WebWhatsapp-Wrapper-master/sample/echo.py"
    }
};