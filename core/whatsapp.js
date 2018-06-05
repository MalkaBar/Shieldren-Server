var { spawn }      = require('child_process');
var algoController = require('../controllers/algorithmControler');
var debugMode      = require('../configuration').db.monitor;
var { Script }     = require('../configuration');

module.exports = class WhatsApp {
    constructor(socket, data) {
        this.uniuqeID = null;
        this.qrString = "";
        this.socket = socket;
        
        algoController.pullChildData(data.child, (err, result) => {
            if (err) {
                if (debugMode) errorMessage(err);
                this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
            } else {
                let buffer = "";
                this.childInfo = result;
                this.subproccess = spawn(Script.executer, [Script.path, this.childInfo.phoneNumber], { detached: true });
                this.subproccess.stdout.on('data', (data) => { dataReceived(data.toString()); }); 
                this.subproccess.stderr.on('data', (data) => { if (debugMode) errorMessage('Error: ' + data); });
                this.subproccess.on('exit', (data) => { errorMessage('Close connection for ' + this.uniuqeID); });
            }
        });    
    }

    dataReceived(message) {
        try {
            if (debugMode) debugMessage("Json arrived " + message)
            let obj = JSON.parse(message);
            switch (obj.code) {
                case -1:
                    this.subproccess.kill('SIGTERM');
                case 0:             //Whatsapp session been logout
                    algoController.qrBeenClosed(this.childInfo.childid);
                    break;
                case 1:             //Send QR to user
                    this.qrString += obj.data.chunk;
                    if (obj.data.index === -1) {
                        this.socket.emit('qrArrived', this.qrString);
                    }
                    break;
                case 2:             //Notify user about successful scan
                    algoController.qrBeenScanned(this.childInfo.childid, (err) => {
                        if (err) { return this.socket.emit('qrError', 'Error while update DB.'); }
                        this.socket.emit('qrScanned','QR been scanned. closing session.');
                        this.socket.disconnect(true);
                    });                    
                    break;
                case 3:             //New message received
                if (debugMode) debugMessage("Message been sent to classifier: " + JSON.stringify(data))
                    algoController.sentenceRecieved(obj.data);
                    break;
                case 5:             //Child process start to run
                    normalMessage('Start Whatsapp session [' + obj.seesionID + ']')
                    this.uniuqeID = obj.seesionID;
                    break;
                default:
                    if (debugMode) debugMessage('Default: ' + message);
            }
        }
        catch (err) {
            errorMessage(err);
            this.socket.emit('qrError', 'Error received. close session. [err = ' + err.message + ']');
        }
    }
};

function debugMessage(message) { console.log("\033[0;35m[WHATSAPP DEBUG]\033[0m " + message)}
function errorMessage(message) { console.log("\033[0;31m[WHATSAPP ERROR]\033[0m " + message)}
function normalMessage(message) { console.log("\033[0;33m[WHATSAPP ERROR]\033[0m " + message)}