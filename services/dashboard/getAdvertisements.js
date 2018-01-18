var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();
    var now = new Date();
    var dateForSearch = now.setHours(23,59,59,999);
    var search = {
        expireDate : {
            $gte : new Date()
        }
    };
    console.log(search);
    
    findHistory(search);

    function findHistory(search) {
        
        db.advertisements.find(search)
            .then(function (result) {
                res.json(lib.returnmessage.json_success(result));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };


}

