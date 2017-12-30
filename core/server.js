var os = require('os');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require("fs-extra");
var cors = require('cors');
var connect = require("connect");
var morgan = require('morgan');
const { exec } = require('child_process');

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
  ].join(' ')
})

var app = express();
var http = require('http').Server(app);

app.use(morgan('combined'))
app.use(cors({origin:true,credentials:true}));
app.options(cors({origin:true,credentials:true}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

var port = process.env.PORT || 3003;
app.set('port', port);

app.locals.name = 'Shieldren';

process.on("uncaughtException", function (err) {
  console.log({data: 'uncaughtException', error: err.stack});
});

http.listen(app.get('port'), function () {
  console.log(app.locals.name + ' server running...');
  console.log('Port: ' , app.get('port'));
  console.log('Mode: ' , process.env.NODE_ENV?'development':'production');
  console.log(new Date());
});

app.get('/', function (req, res, next) {
    req.sendFile({root:process.cwd()+'/public/index.html'});
});

app.get('/privacy',function(req, res, next){
  res.sendFile('privacypolicy.html', { root: path.join(__dirname, '../public') });
});

app.get('/newconnection', function(req, res) {
    exec('python ./ConnectWhatsApp.py', (error, stdout, stderr) => {
        if (error) {
            res.writeHead(500, {'Content-Type': 'text/plain' });
        }
        if (stdout) {
            res.writeHead(200, {'Content-Type': 'text/plain' });
            res.end(stdout);
        }
    });
});


app.get('/*', function (req, res) {
  // res.send(app.locals.name);
    res.sendFile('404page.html', { root: path.join(__dirname, '../public') });
});

process.on('SIGTERM', function () {
    process.exit(0);
});
