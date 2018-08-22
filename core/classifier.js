var { spawn }     = require('child_process');
var { Algorithm } = require('../configuration');
var debugMode     = require('../configuration').db.monitor;
var db            = require('../core/db');
var notification = require('./notification');
var uniqid        = require('uniqid');

var ClasiffierSentences = {}

class Classifier {
    constructor() {
        this.subproccess = spawn(Algorithm.executer, [Algorithm.path], { stdio: 'pipe'});
        this.subproccess.stdout.on("data", function (data) { processRecievedData(data.toString()); });
        this.subproccess.stderr.on("data", function (data) { debugMessage(data.toString()); });
        this.subproccess.on("exit", function (data) { errorMessage("been exited. Reason: " + data); });
    }

    clasiffy(sentenceData) {
        let identifier = uniqid();
        ClasiffierSentences[identifier] = sentenceData;
        this.subproccess.stdin.write('{"id": "' + identifier + '", "sentence": "' + sentenceData.message.toString() + '"}\n');
        debugMessage("Sentence send to clasification: " + sentenceData.message);
    }
}

function processRecievedData(data)
{
    try {
        debugMessage("Received Data = " + data);
        let obj = JSON.parse(data);
        switch (obj.code) {
            case 1:             // Model have loaded and calssifier ready to start
                normalMessage("Finish loading.");
                break;
            case 2:             // Classify sentence been recieved
                debugMessage(JSON.stringify(data));
                let sentenceData = ClasiffierSentences[obj.data.identifier];
                delete ClasiffierSentences[obj.data.identifier];
                sentenceData.group = sentenceData.group?1:0;

                switch (obj.data.classification)
                {
                    case 1:
                        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + sentenceData.caller + "', '" + sentenceData.callee + "', '" + sentenceData.timestamp + "', '" + sentenceData.group + "', '" + sentenceData.message + "', '" + obj.data.classification + "');",
                        (err, data) => {
                            if (err) errorMessage(err); 
                            else debugMessage(data);
                        });
                        /*
                        notification.Notice("הורה יקר, נמצא כי ילדך חווה כעת בריונות רשת.", sentenceData.parentEmail)
                            .then((data) => { console.log("[Urban] " + data); })
                            .catch((err) => {console.log("[Urban] " + err); });
                        /*/
                        notification.Notice('.הורה יקר, ילדך נמצא תחת איום',null, (err, recipient) => {
                           if (err) console.log('[Notify] Failed to notification to client ' + recipient);
                           else console.log('[Notify] Sent to client ' + recipient);
                        });
                        //*/
                        break;
                    case -1:
                        db.run("INSERT INTO [shieldren].[messages] VALUES ('" + sentenceData.caller + "', '" + sentenceData.callee + "', '" + sentenceData.timestamp + "', '" + sentenceData.group + "', '" + sentenceData.message + "', '" + obj.data.classification + "');",
                            (err, data) => {
                                if (err) errorMessage(err); 
                                else debugMessage(data);
                            }
                        );
                        break;
                    default:
                        break;
                }
                break;
            case 3:             // Script start to run. Loading the model.
                normalMessage("Start loading");
                break;
            default:            // Errors
                throw new Error(data);
        }
    }
    catch(err) {
        errorMessage(err);
    }
}

function debugMessage(message)  { if (debugMode) console.log("[\x1b[34mCLASSIFIER\x1b[0m] \x1b[36mDEBUG\x1b[0m: " + message); }
function errorMessage(message)  { console.log("[\x1b[34mCLASSIFIER\x1b[0m] \x1b[36mERROR\x1b[0m: " + message); }
function normalMessage(message) { console.log("[\x1b[34mCLASSIFIER\x1b[0m] " + message); }

module.exports = new Classifier();