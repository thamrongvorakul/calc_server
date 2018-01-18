var SCHEMA = require('./mongoAdapter/connection/setup.js')
var db_schema = SCHEMA.GET_MONGO_SCHEMA();
const multer = require('multer');

module.exports = {


    startRouting: function (lib) {
        lib.GridFS = SCHEMA.GET_GRIDFS_SETUP();


        lib.app.use('/' + lib.config.APPPATH + '/service/\*', function (req, res, next) {

            var uid = req.headers.uid;
            var ucode = req.headers.ucode;
            var param = { uid: uid, ucode: ucode }

            var sessionvalidator = require('./module/session.js');


            if ((uid && ucode) && (uid != 'null' && ucode != null)) {
                sessionvalidator.validatesession(param, db_schema, lib, function (err, result) {
                    if (err) {
                        if (err == "Dupplicate") {
                            res.json(lib.returnmessage.json_error_msg("Invalid uid ucode please check input data."));
                        } else if (err == "Disabled") {
                            res.json(lib.returnmessage.json_error_msg("User isn't activate."));
                        } else {
                            res.json(lib.returnmessage.json_error_msg("Session is expire. Please relogin"));
                        }
                    } else {
                        lib.userprofile.setUserProfile(result);
                        next();
                    }
                });
            } else {
                res.json(lib.returnmessage.json_error_msg("Session is expire. Please relogin", "Session is expire. Please relogin"));
            }

        })

        lib.app.get('/public/authentication/mail_active_user/:uid/:token', function (req, res) {
            try {
                var service = require('./public/authentication/mail_active_user');
                console.log("*************** start service mail_active_user ***************");
                service.startProcess(req, res, db_schema, lib);
            }
            catch (e) {
                console.log(e.message);
                res.json(lib.returnmessage.json_error_msg(e.message));
            }
        });

        lib.app.post('/' + lib.config.APPPATH + '/public/authentication/:service', function (req, res) {
            var reqjson = req.body;
            try {
                var service = require('./public/authentication/' + req.params.service);
                console.log("*************** start service " + req.params.service + " ***************");
                service.startProcess(req, res, db_schema, lib);
            }
            catch (e) {
                console.log(e.message);
                res.json(lib.returnmessage.json_error_msg(e.message));
            }
        });


        lib.app.post('/' + lib.config.APPPATH + '/public/pub_service/:service', function (req, res) {

            var reqjson = req.body;
            try {
                var service = require('./public/pub_service/' + req.params.service);
                console.log("*************** start service " + req.params.service + " ***************");
                service.startProcess(req, res, db_schema, lib);
            }
            catch (e) {
                console.log(e.message);
                res.json(lib.returnmessage.json_error_msg(e.message));
            }
        });


        lib.app.post('/' + lib.config.APPPATH + '/service/:service/:action', function (req, res, err) {
            var reqjson = req.body;
            var serviceApi = './services/' + req.params.service + '/' + req.params.action;
            var now = new Date().getTime();
            var userprofile = lib.userprofile.getUserProfile();
            try {
                var service = require(serviceApi);
                console.log("*************** start service " + req.params.service + " " + req.params.action + " ***************");
                service.startProcess(req, res, db_schema, lib);

            }
            catch (e) {
                console.log(e.stack);
                res.json(lib.returnmessage.json_error_msg(e.message));
            }

        });

    }
}
