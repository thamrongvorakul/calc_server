var http = require('http'),
    https = require('https'),
    log4js = require('log4js'),
    express = require('express'),
    fs = require('fs'),
    helmet = require('helmet'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    mongoose = require('mongoose'),
    multer = require('multer');


var config = require('./config');
var globalConfig = config.getParam();
var schema = {};
var lib = {};
var app = express();


var mongooseConnection = require('./mongoAdapter/connection/setup.js');
var routeAPI = require('./routeAPI.js');

log4js.configure(globalConfig.LOG_CONFIG, { cwd: __dirname + "/logs/" });

lib.config = globalConfig;
lib.log = log4js;
lib.app = app;

app.use(compression());
app.use(helmet());
app.use(bodyParser.json({
    limit: '2mb',
    strict: false
}));

app.disable('x-powered-by');

app.use(function (req, res, next) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // ต้องเซต allow origin ด้วย และยอมให้ผ่าน uid ucode มาด้วย
    next();
});

startMongoose();

function startMongoose() {
    mongooseConnection.setUpConnection(lib, function (err, success) {
        if (err) {
            console.log(err.err);
        } else {
            console.log(success.message);
            lib.mongo_query = require('./mongoAdapter/query/mongodb_query.js');
            startSetupRouteAPI();
        }
    });
}

function startSetupRouteAPI() {
    routeAPI.startRouting(lib);
};




lib.app.use(function (error, req, res, next) {
    //Catch json error
    if (error) {
        res.json(lib.returnmessage.json_error_msg("error data"));
    } else {
        next();
    }
});

app.use('/' + globalConfig.APPPATH, express.static(__dirname + '/www'));

// app.get('*', function (req, res, next) {
//     console.log(req);

//     var err = new Error();
//     err.status = 404;
//     next(err);
// });

// handling 404 errors
app.use(function (err, req, res, next) {
    if (err.status !== 404) {
        return next();
    }
    res.send(err.message || '** Files not found **');
});


app.set('port', process.env.PORT || globalConfig.PORT);

process.on('uncaughtException', function (err) {
    log4js.getLogger('error').fatal("UNCAUGHTEXCEPTION | " + JSON.stringify(err.stack, null, 4));
    console.log(err.stack);
});

process.on('exit', function () {
    console.log('GOOD BYE -..-');
});


// var serverOption = {
//     key: fs.readFileSync(globalConfig.PRIVATE_KEY_PATH, 'utf8'),
//     cert: fs.readFileSync(globalConfig.CERT_PATH, 'utf8'),
// };


var server;
if (globalConfig.isHttps) {
    server = https.createServer(serverOption, app);
} else {
    server = http.createServer(app);
}

server.on('error', function (e) {
    log4js.getLogger('error').fatal("SERVER ON ERROR | " + e);
});


server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


