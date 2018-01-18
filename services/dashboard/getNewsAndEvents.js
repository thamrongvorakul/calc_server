var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    search = {};
    findNewsAndEvents(search);

    function findNewsAndEvents(search) {

        db.newsandevents.find({})
            .sort({createdDate : -1})
            .then(function (result) {
                res.json(lib.returnmessage.json_success(result));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };


}

