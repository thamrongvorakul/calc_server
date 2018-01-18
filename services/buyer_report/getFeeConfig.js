var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        $or: [
            { isWithDrawalCost: true },
        ]
    };

    findHistory(search);

    function findHistory(search) {

        db.configurations.find(search)
            .then(function (configResult) {
                res.json(lib.returnmessage.json_success(configResult));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };


}

