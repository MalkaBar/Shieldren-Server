var express       = require('express');
var path          = require('path');
var bodyParser    = require('body-parser');
var cors          = require('cors');
var morgan        = require('morgan');
const { network } = require('../configuration');

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
  ].join(' ')
})

var app  = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
app.use('/api',       require('../routes/api'));
app.use('/',          require('../routes/public'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

var port = process.env.PORT || network.port;
app.set('port', port);

app.locals.name = 'Shieldren';
app.locals.loginUsers = {};


process.on("uncaughtException", function (err) {
  console.log({data: 'uncaughtException', error: err.stack});
});

io.sockets.on('connection', (socket) => {
  console.log("WS: new client " + socket.client.id);
  socket.emit('response', 'connected');

  socket.on('request', (message) => {
    if (message === 'qr') return socket.emit('response', 'iVBORw-67KGgoAAAANSUhEUgAAAQgAAAEICAYAAACj9mr/AAAYU0lEQVR4Xu2dUY7kSI4Fq69Qe49qVN//DAPMQfYMsYhZ9AIDBD3y2byllJlWvyW6u8hHczqlUP7x89fvx49P9u+///mPlyv+rz//qt3JNMdzgmmek01tYYeBTvdPfEZspuVt+YbEZkM3zTk2tPT3HH8IiNfuFhA/fgiIPBWbPstn71sIiMGnAkJAkHQTEMRrZZuNIAgIAUFku6FNsi5qYwVhBTFqpyl2exC9/hhNdmInIASEgFhobn+5JuUW8Sd1ko48IeRW4Db8SXxG7r95/Lp6fqIZ8iSLxIauLbU7rW2sIDYEfbqRLYcSgaYBeF6/4U/iM3L/AiJ/1E1iQ3RGbAQEfHeAOHuyERC9d1eagKIxTt+3EBDU04PdlkPJDkpuVUAIiCs3D1qte8QoNqhOQRAQAkJAkK3VCqLmNVJ1kQqqWeJfPT91vkeMhd87nJp3W2InAmm+H9Ccn4xFbEhSk3maNk2okXXdQc9Et/ERoy0OsmhiQ4KaloRt36TzN++Rnlm31pDOIyDYm7ECIlXa4ZGlgADOXDIREAJi/Bl2W4N3rWDa9zmNtwXC5v0ICAEhIJoZdRhLQOSOtgeR++xfFmQ3JjZweS/N7jp/8x7tQXTffhUQUJ0k2YgNXJ6AeOEBK4hcTQIi99laBUFeUmoHtAk1cj9b/YR0bVuwSdcF5TyatfVE1kc0+C2eYhBxtANKgjOJgNyPgHj9JidJNGLT1hNZA9GggBg83Q4oCY6AIGnw2qYJVbKqtp7IGogGBYSAIFobbdJE9IjBGvUkaAJi+OFVKtqn89vEJ8GxgiBpYAWR6qb6PYg28UnipDYCYk60rXhu9UDS5Ogh6DxSe8Mh607z5jnHtz9ipL/Ke1ddpAJtJ2g6PxHayWbjfrbeiiRJTUBIEpfEjcwjIMCxhCQBCQ4RgYB4/fXorSpSQJQ/sEISJ7Vp7zgCYu/I8mqmdjybSd0ci+jstKmkeeMRA/6dTRI4EhwriLzhSI6MzaRujkV0JiDA7zfaOw4JnIDo4a4dz2ZSN8ciOhMQAgJlGjmDk4naovaIQaKQVV4+5hw+n3d6IkF2qTa9e9Lo/jLRpxi5P8kTkTZsSRUbP8VoipYKLd0NiaPTOU6wIeAg4xGotW2a+iD9BGJDjgWTDUlCorUNP6MmZXNhAuK8E6Vgayd7M9mIbsj8xEZAzH9Y2ApiUAeheprQz6lJUqe7V/soRXwjIOYk3PInAaGAEBBj7jZ3YwEhIIgGYnG+23VfDdje2QmJm7t+cyxSwWzteARQxGYjnqRJWU2ow2DVpxh3WHQqUAGR/zVqeixp6oMkO7EREKAH0Qx0e6y0U9zeJYkIN2zILnW1jbFpZ0d3vLEH0Z2mO5qAyP8Qbuqz01GuCRUB0c2N9mgCovhrzqvF3kxcAcGeMBEQt5O6OZ6AEBCjnojYU5uroUp7LemRkfTBmolOxxIQAkJALGhAQFBEATt3KXsQ6ZOHqysVAQESnZoICAEhIGj2ZHZ/PB6PR2by+a7eat6dPJOeWU9n42me9P2Qd3OkID41Npuqacez6c/mfd5hLAEx/BSciFBA5D+DJklAYkNKfAJccj93thEQAmKlSdlMAgHR9OZ5LAEhIATE4AEriB8/BISAEBACYtSAgBAQAkJAzID4+ev3//tTDFKqNc+ZVz8DJ83Lk03z6UK7eZc+rbl6/ndPclqn/XYOkHUR3ay8Sdl2TnqjAqL7F6Sb/hQQc6oT37Q3FgGx8JqtFcR9AWUFcf5L9gJCQMTVqhVE7LLjt0en0awgDn62BzE7Jz1iPUciNtMKBISAyD1wsLAH0T1nkmQnNgKilwbtHCArIxoYH3OS8oY4gdxoWpI1d7ytfkL7bEzEQWKTaoDojKyr3bxL/Uk0SO6zPY+AAD2IFFBEnAKCpAezSZOdHNnaidus7k5eExACgmXVYGUF8foL0QLizV+JqqpwGCx9See0S6dCpzv+1cJpl/ip39rzE51ZQcxes4KwgiA5NdoICCuImjiqyvxx/R+HIbuhFcT8R1va+kjP7Vc/aif339aTFYQVBNFhbZMgUK0uGL4jkh5L2ombwo4egatvUqZOI91g8kSgLcK0jG4Lemu8Zk+nKei2/5v3uZUDZB4SAwEBsq0tULCEFZNm4hBxkvmJY8g8qU3zuLK1sT7nERBAUQLi9Ve1SRlLSu+2/9NkJ0+/BMTSWc4jBiAaNGkmjhXE3IwlxwViQ2JgBQGSp72DgSWsmAiIvFIiibtlIyDA5+NIpgmIPHGIOAmgSDzJPKnNlztikCRInUbOck0BnJo9p3maT0WuPoO3hUvi07TZ0u205rvmAOkPHZuUW44mDk0FRZJAQHS/IZHGjF6/pVsBMZTrJHE+4y5J7pOI+jP6pllBEZ+RRjWJ5xZsNjZJK4iDAqwgZucQ3wiI3J9XbwQCQkCgzVhAsN/weMTwiDEmXHMHvXpnERAC4rSzjO9BfKXzF0kCcmYlW7iAIF6bbbZ0+20qiMfj8fIva5FdkgQndfTz+uY8TXm2QZT6hviFxJk0CdvzTGu480tHqdaIz9obzm1/7r2VbGnQaGVBkldA5NEREPlLbCdtCohcg6g3ISB2PgwjIASER4yLP3LjEaPbA0krReL/02NOK4hileAR4+xMsoM3w0PmJzZpD4Tcoz2Ig9fsQczOab55R0RIdrD2PGmCEj2RNW8cJYn/cQXx89fvl08xtqhKxJ7akECTIHxGEZKdjdiQGDQ1SNZMNECOC02o0Ap3sovfg2gGmlJNQMyNqHYitMZr6oaM1bqPv8dJk5psHu01E78JCBAFsrMRm7SMBreyZkLE2fRZ+0YFRPHjK+2XN6wgrCDaCZ+OJyAExKgZsrMRGyuI1yAk1UgKgHfXCwgBISDeZUnw/ySpm1ANlvqhSwWEgBAQH0qVj10kIPKvWn/Msx+/isRgfNV663ENWfTHXfL+ynQnOD15Oc22Nc/7O/73K9rrIuOla25ff1cNXr2up58FRPG7FwLivr+0PcXm6kS881FKQAiIeEO+wzP9eNEHAwExO0dACIg41wRE7LKjgRXEJ6R3uyQlZ/ONna29LjJeN93y0Tb8TI6fV6/LHgT8OhUJHEkcMk+aHu11kfHSNbev3/DzlwPEltM2BNUuidM3OWk1kvrmK8Vsy2f0qdS0PnJcIDbp/Kf7POms+kUpQvY0CcgcAoJ4bbbZiJmAmL+2TaoRAQH7HETsVhDX/hZkC/gEq6QaIDZWECQ6g82WoJqwed5KOp5HjNxnHjHOPvOIUXzMmSb0O3Gm4wkIAXHSDKl8BYSAiGu1FFzxBG8MtipCsm5yXCA2HjFIdDxiFL1mk5I4kyQ7sbktIMju0S590zVszb81DxHuZEPWnPq/ud53Y5H7aSbbxlikP/XOb9P/x0cMIo5m0IhztubfmocG+5UdWTPRQHPNp7HI/WwkNekNnO5zKwYCAii3WRJeLQKSUFviBKH5Qe5HQMyeFhBAhQLi2vcgrCDY0xog9fl7EOSRSPOc29xZm7vK6YizNQ8JdDM2VhD5W44eMQ6qvTpxtubfmkdAzB5oxqCZ1M2xSB+Oamb8uxjNcxlxTtOGiKY5/9OX7TWkDcfmsYhUEOT+qahbdkQDd84bUkUKiMFrRBzEZusoJSBybDTjScZq2wiIT/glbgGRJ+6WBUlQK4jDq8mksblhQ8pbIg5iIyC20j2fpxlPMlbbxgrCCmLMAo8YAkJACAgBkXMg9hlpOrerAVJ5VwFBOtVkAWRnIzbkbJjeDxEBOWI0xVHMJzQUOf4Rn51smv5s309TtyRA41MMATG7kwiKCCcFYTNmREzEhvhFQCy+Sfnz1+/HK4c3xXYSQZoEz7USmyaJBQRBwWsbAcF82czP0wqsIJY+GEMSIQXhlmiYpAVE029bsRYQAqKp23gsAk6PGB4xjq8mpzvrHQRFEiG9z61dJabAwYD45Q7xTBvYTZ+djtnteawgrCDamorGExCRu/7v4q3NIAYECejWzTBX51akSUl2nI0K4uoG8tWPhmnTO43NVtXTnkdA5HwYjz8EhM0EvXp+kmwCgvUTtjZqASEgRg+QXTK1ERACIv4LUSBnV008YvxVg4qAEBACAnbxm7vxRg/EI8bOh4GefvaIsVoTZJNZQVhBpPBuNw8/JSBIk4zsbJMNmf+uyX7n3TjDaf9q0tg9rYIkW6pBsubmuiigqk1KkqAC4vPtxv2Uz0YkySYgZg+c8lZA/Pk6QQnsiHCbNlsNvyyd+1cTnwkIAYGaoR4xmHD6af/xEQXEx331kSutIMBTBCsI9vjtI4L8T68REP+pB//dXkAIiLXHYl3pvh5NQHS9LCAEhIAAGiBpSB5/EhuytvTJy/P66h/vbT6WaZb4pHnXnP/paDJeUwSk19K0IeJszk80QPx/52Qn/hQQFz/FICIkNkQcTRsBMT/OJvHc8qeAEBCjPgVEnrpWEOAva+VuZiV5U9DkSNBunhG/TTZbvkmPmaT037Ih/hcQAiLece1BzKm2lexkHgFhk/Lyj78QERIbK4h/ILCnvv5yFcT0dzFIEyR15vP6tCQ97cYkCciaic2d15beD4nZnfVE1pb6oH1kTWN2uh69B0GcRhadOlpAEC93bUjM7qwnsrbUBwICajB1tICAji6akZiRJCRL3lpbOo+AINH0iHH5C1QkbGly0PL2zmtLfSAgSDQFhIAAf5fkJLU0cSm80nkEhIA4esAm5Wv3kMQREDDZBjOblOVdioRHQAiIVDdplZKO//f1R0A8Ho/Hq4Gbgr7zG4aTU9vBITvlRgya6yINZFri02S4yo7oibzcRWxOPqn+FoMkGxHoRpBJQNtiFxDzy00bGmjOQfREkp3YCAgQaRJQATH/hob4866bB5BT9YXA5/xk8yAxsIIYok2cKSAEBKmiJxtSDRAbKwiAfAExO430lIg/rSDy348ICJDsxIQI2grCCsIKYumRIUnQrV/SkXnIbpj6oL17ELCmNmTNbZutpE59c7o+1QbdvFZ6EMQxxAEkccnayDwC4rWn28lOmncCYj7KCAhACAEBnDaYCAjmS7KBkmaogADxERDAaQKi5zT4GyYBMfRHmrR9OllA9LRuBcF82dT05a9aExcQB5DEJWsj89iDsAdBtNbsj1QrCLKwrcRJHd2EzXPu5nhkrPT+6fXNeDabh+3uPoF3mh/NOU4abM8z9iBSB2yW3qngSRKS0ve0LpJs6X22rydrTm3agm7HOvXp1SBs+1NAFJtnAiLvz7QFLSC6P3ATEAJi5FpaDZAqUkCkNcr/Xr9VqQgIASEgim8HbyXu1jwCQkAICAExakBACAgBISBmQEx/Wat5/iSnrGazqTkWPf+RkjBdN3nyQmy2mrHN/sTWT9SJ1rdyLdXT817+EBCvQ0oSZ8tmEuHV85MmJYENSUIBwd7fERDFI8bVCXr1/AKCoCt/NHzy82kFVhDF32JsJRuZxwoiT0QrCCsI9COqq5NNQMzJbg/ir7iBbAVx8ABp9giI/LuHpG9AylsB8QkB0SYUSdC8wMwt2iXpBrzaSUjGuzqe5GlRro7Z4ur5SX6eQBw3KckCSACauweZX0CwM6uAeL3rX63nZ1wIvATEoGgBISCaG4uAgN9JuHrHmeYXEAJCQIAXpTxidJ9bk3P+Rj/jVJKSxNnaQUkZTe4n3Vi27p/kpz0IoAArCCsIIBt0zifzEBsCT3sQ9iBGrZHq5uojI0kCkmzfvoIggSaCIuVyWq6RaqBdqhEREn+m86S+bB89Tuvd0Ebqr3fXNwFF4t+O51hBCIhZCk0REBC9E2ny/21BJXO/u1ZAzC9KkfxMq57n9QICfAtAQOTCfQeDV/8vIHI/t4EvIAREnLuk9I0nWfwDRWRt6W7cTlwriD9776Hbg5hTYEu4JAmtIKwg0C8wU1ELCAFBAEVsmsdPUqmlufGu6Rz/8V7SdSaObtq0AbG1tmYZSdZMxJ7akNi0bYifm/e5Mf8JBMcXpR6Px+PVArfoRYSb2hBBpXPQ6+/s5zQJiAhJbNo2GwnajvNGbP71FENAdP8SUQqKtnDS+U/Xb4iwneykbyEg5hwQEOApxkYS3uEoJyDyj+ncFVCkurOCODxKa0KA7NIC4r4/iiPJ1q4UN+AtIATEkYMbIvSIMYeAfK+0beMRwyPGqFAB4REj/jUnKZVIuUx2lmme5ljto8dnXBt51k78RrRGegBb90N80LQhwBcQN64grhYuEdSGoK/ecJr3uDkWiaeAEBDVI0ZT8FYQTW8ufbSWBO1q4n/GMv7pMyuI3m8R7qyBLgbm0awgBt/cWRyfcW1b4CKbkT0IARHvrJ8xCa0g2DcxBUQZENOr1ltPBEjZk+4sZMf7jFDZuk/im404n6BK1kxK/1SbZA5qQ/QxvgchIHrfo6ABTWNABEASp2lDXuy5uqd1ml9AFD/k8nT0xs6ylThtEAiIz9ekFBACIu6BtMFBoJrCpl2ukzWTZLu6B0HW3NbHNB7ZKD1ifKEnH0QAzeMCgYpHjC08sMfmAkJAjApt7sZWEHsgsII4HHNeOWdrZ92SAEk2jxg7Tedvc8QgIrzaOWTHa9KWAKJd4pM1NG1SGF+tmea932Gs1P+nBwXP/4t/7t0+MzadKiCa3mRjpQIVEMzPzY3tFAMBMXg6FToNsxVE/iiT+vo72BHdCoiwZ3HqxrdFJiAERFNTAuLgTY8YTamxsVKBesRgfvaIAfwmIIDTyiYCouzQcLjU/7hJGa7rFpdf/eSFNHCbNnc4rqQCJWtui61ZxaT3f7oX4pu2TfyiVDs4zfEERP6sv5kcpHdDBN3UzLsdNJ1LQKQeW7xeQAgIIrcmJAUEicCSjYAQEERqAmLWjUcM8AiUdJCb8CLNWGJDki3dQT1izF4mvmnbCAgBQTgw2giI3h+Dbic72STGz95XVVMeLBUh7RSny24+kUjnftdsu9pnZP5m1UX8SWxIEm7ZkMpXQNy4gkgFSnacdI53ICIinGwExE5P6QRvASEgYkaQpp4VRDfZSdVB4C0gBISAiD0wG5DE3bIRECDQZDckjiblcno7HjHY39JI/Xy6fivZyTxEt1YQVhBxfhCoesTwiBELjRoQsaWNMLI2n2LkpTd5wkT8TOJJbMjOvmVTrSCaSUgc3SyXr97xSEm65TPi57YNEW4K/Laev8uRcTxitB2aCp6IMBVNO3G3QETuc2uXIvMIiNceaOYAqdSeNgJi8BwBpICY//bClm82dvanZDbmERAHrDWdc7U425WKFcTs0Y3EFRA/2F/hSY8RtOxJd3cBwXZ2clwgNh4xPGLE7LCCiF02lr3PkUjibtkIiC8ECLIbkxJ7CxBpNdIuL4k/m2smscnRdf0LTO37JHEjfmvCkxxN4yZl2zHNXYo4oJlszbHuIGhyPyQGzcQhY5H7bOdBum6yZhIbAfHP/Pf7zUYYERoRx9Y8RIRpcrSv3/Jnc91kzSQ2AkJAjLrdEmEzcchY5D4JcMnaPGIMCWoPYpbTlqDJPGSXaiYOGYvcp4AAidsMjoAQEERPxEZAHD5a+/PX78crp5LmYTM4AkJAED0RGwHxTQDxGcu+LRA2E4es+c6xIU3n9H4IhE4xS+d/jkXW8KWalMRpJHGajSOSbFvnfFJFEptmDEhsBMQcAQFRVCchtIAoBuAw1Ck2AkJArKhQQLBXujeCIyA8Yhx/i3C1CMmxIAVO+4hFjgvE5urYWEFYQWxoEDWBPGKshOYYGwHxzQGR7sRPd5HEJTs4WRtJqWYSNNe85TMyD/Ez8Q2JzUZF+pzjWzQpm0E7PS4iIiRrI8IlIiQ26dq2fEbmSe+FPkps+plsbKf7FBCDd4ijiQgFxPySDnlkSXZWAoKNtRFtEN0KiOIPsqwgWDe8mbjtxBEQ9iBiDRASW0HEbkZPngTE7GeiWysIKwj0Febm2dgKIk/qNgjJePYg7EGMyhUQeUVEkrDp58sriNxlzILcKCnxyequFsHWbrwh3PYbjiSen/E+yZqJTVxBkAAQGwGRe40AcitBiTiJTe617h/BIWu+s42AAIqygtj5jidJHBBO1J9Jq7g2iIlviI2AAIoSEAJCQIDOP8i1uEHWfg+BrFlACAgBISBGdggIAfHtAUF21i2b5k+Km8l+uv+teaY1XO2zLW2Qc3aa7Fv3QuZp9zrGHgRZ3JbN1WJvPy3YEOjVPtvShoCYqzviGwEBjlICIj9iCIgdD1hBwL9UnZbep3AKCAGxk+75LAJCQOSquYHP0KKBESmjN4544FaQiYC4gditIKwgUPYuGAkIAYFkZpMyhxrZCFBwikZtQPwPfh9zc3zv8Q8AAAAASUVORK5CYII=');
    socket.emit('response', 'unknown request');
  });
});
io.sockets.on('disconnect', () => {
  console.log("WS: client disconnected " + socket.client.id);
});
http.listen(app.get('port'), function () {
  console.log('\033[0;32m[SERVER]\033[0m ' + app.locals.name + ' server running...');
  console.log('\033[0;32m[SERVER]\033[0m Port: ' , app.get('port'));
  console.log('\033[0;32m[SERVER]\033[0m Mode: ' , process.env.NODE_ENV?'development':'production');
  console.log('\033[0;32m[SERVER]\033[0m ' + new Date());
});

process.on('SIGTERM', function () {
    process.exit(0);
});
