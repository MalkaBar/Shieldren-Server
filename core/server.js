//var os            = require('os');
var express       = require('express');
var path          = require('path');
var bodyParser    = require('body-parser');
//var cookieParser  = require('cookie-parser');
var cors          = require('cors');
var morgan        = require('morgan');
const { Port }    = require('../configuration');
//var fs            = require("fs-extra");
//var connect       = require("connect");
//const { exec } = require('child_process');

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
  ].join(' ')
})

var app = express();
var http = require('http').Server(app);

app.use(morgan('combined'));
app.use(cors({origin:true,credentials:true}));
app.options(cors({origin:true,credentials:true}));
//  Environment variables
app.use(express.static(__dirname + 'public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
//app.use(cookieParser);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//  Routes
app.use('/api',     require('../routes/api'));
app.use('/public',  require('../routes/public'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

var port = process.env.PORT || Port;
app.set('port', port);

app.locals.name = 'Shieldren';

process.on("uncaughtException", function (err) {
  console.log({data: 'uncaughtException', error: err.stack});
});

http.listen(app.get('port'), function () {
  console.log('\033[0;32m[SERVER]\033[0m ' + app.locals.name + ' server running...');
  console.log('\033[0;32m[SERVER]\033[0m Port: ' , app.get('port'));
  console.log('\033[0;32m[SERVER]\033[0m Mode: ' , process.env.NODE_ENV?'development':'production');
  console.log('\033[0;32m[SERVER]\033[0m ' + new Date());
});

app.get('/', function (req, res, next) {
  res.sendFile('index.html', {root: path.join(__dirname, '../public') });
});

app.get('/privacy',function(req, res, next){
  res.sendFile('privacypolicy.html', { root: path.join(__dirname, '../public') });
});

app.get('/*', function (req, res) {
  res.sendFile('404page.html', {root: path.join(__dirname, '../public') });
});

process.on('SIGTERM', function () {
    process.exit(0);
});
