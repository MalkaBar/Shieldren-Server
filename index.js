var exec = require('child_process').exec;
var cluster = require('cluster');
var isProd = process.env.NODE_ENV == 'production';
var numCPUs = isProd ? require('os').cpus().length : 1;

function startServer() {
    require('./core/server');
}

if (cluster.isMaster && isProd) { // cluster.isWorker
    for (var i = 1; i <= numCPUs; i++) {
        var workerInfo = {worker_id: i};
        cluster.fork(workerInfo);
    }
} else if (isProd){
    console.log('\033[0;32m[SERVER]\033[0m cluster id:',cluster.worker.id,'process id:',process.pid);
    startServer(cluster.worker.id);
} else {
    startServer();
}

cluster.on('exit', function (worker) {
    console.log('\033[0;32m[SERVER]\033[0m cluster ' + worker.id + ' died :(');
    console.log('\033[0;32m[SERVER]\033[0m Starting a new cluster...');
    var workerInfo = worker.process.workerInfo;
    var newWorker = cluster.fork(workerInfo);
    newWorker.process.workerInfo = workerInfo;
});