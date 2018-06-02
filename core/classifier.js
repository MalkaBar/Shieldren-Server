var { spawn }     = require('child_process');
var {Algorithm} = require('../configuration');


class Classifier {
    constructor() {
        this.subproccess = spawn(Algorithm.executer, [Algorithm.path], { stdio: 'pipe'});
        this.subproccess.stdout.on('data', (data) => { this.processRecievedData(data.toString()); });
        this.subproccess.stderr.on('data', (data) => { console.log('[Classifier] ' + data); });
        this.subproccess.on('exit', (data) => { console.log('[Classifier] been exited'); });
        console.log('[Classifier] Start loading');
    }

    clasiffy(identify, sentence, callback) {
        this.subproccess.stdio.write('{"id": ' + identify + ', "sentence": "' + sentence + '"}\n');
    }
}

function processRecievedData(data)
{
    try {
        let obj = JSON.parse(data);
        console.log(data);
        switch (obj.code) {
            case 1:             // Model loaded and calssifier ready to start
                console.log('\033[0;33m[Classifier]\033[0m Start loading');
                break;
            case 2:             // Classify sentence been recieved
                    /***
                     * @TODO: 
                     *      1. update user
                     *      2. svae sentences
                     * ***/
                break;
            default:            // Errors
            console.log('\033[0;33m[Classifier]\033[0m ' + err);
        }
    }
    catch(err) { console.log('\033[0;33m[Classifier]\033[0m ' + err); }
}

module.exports = new Classifier();