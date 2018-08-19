var { spawn }     = require('child_process');
var { Algorithm } = require('../configuration');
var debugMode     = require('../configuration').db.monitor;
var db            = require('../core/db');
var uniqid        = require('uniqid');
var notification = require('./notification');

var ClasiffierSentences = {}

class Classifier {
    constructor() {
        this.subproccess = spawn(Algorithm.executer, [Algorithm.path], { stdio: 'pipe'});
        this.subproccess.stdout.on("data", function (data) { processRecievedData(data.toString()); });
        this.subproccess.stderr.on("data", function (data) { if (debugMode) console.log("[\x1b[34mCLASSIFIER\x1b[0m] " + data.toString()); });
        this.subproccess.on("exit", function (data) { console.log("[\x1b[34mCLASSIFIER\x1b[0m] been exited. Reason: " + data); });
    }

    clasiffy(sentenceData) {
        let identifier = uniqid();
        ClasiffierSentences[identifier] = sentenceData;
        this.subproccess.stdin.write('{"id": "' + identifier + '", "sentence": "' + sentenceData.message.toString() + '"}\n');
        if (debugMode) console.log('[\x1b[34mCLASSIFIER\x1b[0m] Sentence send to clasification: ' + sentenceData.message);
    }
}

function processRecievedData(data)
{
    try {
        if (debugMode) console.log('[\x1b[34mCLASSIFIER\x1b[0m] JSON ARRIVED:' + data);
        let obj = JSON.parse(data);
        switch (obj.code) {
            case 1:             // Model have loaded and calssifier ready to start
                console.log('[\x1b[34mCLASSIFIER\x1b[0m] Finish loading.');
                break;
            case 2:             // Classify sentence been recieved
                if (debugMode) console.log(JSON.stringify(data));
                   
                let sentenceData = ClasiffierSentences[obj.data.identifier];
                delete ClasiffierSentences[obj.data.identifier];
                sentenceData.group = sentenceData.group?1:0;

                switch (obj.data.classification)
                {
                    case 1:
                        notification.Notice("הורה יקר, נמצא כי ילדך חווה כעת בריונות רשת.", sentenceData.parentEmail);
                        //notification.Notice('.הורה יקר, ילדך נמצא תחת איום',null, (err, recipient) => {
                        //   if (err) console.log('[Notify] Failed to notification to client ' + recipient);
                        //   else console.log('[Notify] Sent to client ' + recipient);
                        //});
                    case -1:
                        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + sentenceData.caller + "', '" + sentenceData.callee + "', '" + sentenceData.timestamp + "', '" + sentenceData.group + "', '" + sentenceData.message + "', '" + obj.data.classification + "');",
                            (err) => { console.log("[\x1b[34mCLASSIFIER\x1b[0m] Error:" + err);                           }
                        );
                        break;
                    default:
                        break;
                }
                break;
            case 3:             // Script start to run. Loading the model.
                console.log('[\x1b[34mCLASSIFIER\x1b[0m] Start loading');
                break;
            default:            // Errors
                throw new Error(data);
        }
    }
    catch(err) { console.log('[\x1b[34mCLASSIFIER\x1b[0m] Error: ' + err); }
}

module.exports = new Classifier();