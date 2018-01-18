var SCHEMA = require('./mongoAdapter/connection/setup.js')
var db_schema = SCHEMA.GET_MONGO_SCHEMA();
const multer = require('multer');

module.exports = {


    startRouting: function (lib) {

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


    }
}
