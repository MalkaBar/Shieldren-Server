
var path         = require('path');
var cors         = require('cors');
var morgan       = require('morgan');
var express      = require('express');
var WhatsApp     = require('./whatsapp');
var bodyParser   = require('body-parser');
var { network }  = require('../configuration');

global.classifier = require('./classifier');

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
  ].join(' ')
})

var app  = express();
var http = require('http').Server(app);

app.use(morgan('combined'));
app.use(cors({origin:true,credentials:true}));
app.options(cors({origin:true,credentials:true}));

//  Environment variables
app.use(express.static(__dirname + 'public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
//app.use(require('cookie-parser'));

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//  Routes
app.use('/api/child', require('../routes/child'));
app.use('/api/parent', require('../routes/parent'));
app.use('/api',       require('../routes/api'));
app.use('/',          require('../routes/public'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

var io = require('socket.io')(http);
var port = process.env.PORT || network.port;
app.set('port', port);

app.locals.name = 'Shieldren';

process.on("uncaughtException", function (err) {
  console.log({data: 'uncaughtException', error: err.stack});
});

// WEB SOCKET SERVER
io.of('/scan').on('connection', (socket) => {

  console.log("WS: new client " + socket.client.id);
  socket.emit('qrHello', 'Hello');
  socket.on('qrStart', (data) => {
    if (data.parent)
      if (data.child)
        new WhatsApp(socket, data);
      else
        socket.emit('qrError', "Missing child ID");
    else
      socket.emit('qrError', 'Unauthorized');
  })

  socket.on('disconnect', () => {
    console.log("WS: client disconnected " + socket.client.id);
  });
});

app.io = io;
// WEB SOCKET END //*/

http.listen(app.get('port'), function () {
  console.log('\033[0;32m[SERVER]\033[0m ' + app.locals.name + ' server running...');
  console.log('\033[0;32m[SERVER]\033[0m Port: ' , app.get('port'));
  console.log('\033[0;32m[SERVER]\033[0m Mode: ' , process.env.NODE_ENV ? 'development':'production');
  console.log('\033[0;32m[SERVER]\033[0m ' + new Date());
});

process.on('SIGTERM', function () {
    process.exit(0);
});
