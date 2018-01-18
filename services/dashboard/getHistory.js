var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        uid: userprofile._id
    };

    findHistory(search);

    function findHistory(search) {
        console.log(input.sort);
        
        db.histories.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagecount).
            limit(input.pagecount)
            .then(function (withdrawalResult) {
                var retObj = JSON.parse(JSON.stringify(withdrawalResult));
                getInDataFormIdName(retObj);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function getInDataFormIdName(retObj) {
        console.log(retObj);
        
        async.each(retObj, function (data, callback) {
            
            if (data.type == "in") {
                db.users.findOne({
                    _id: data.inData.fromUserID
                }).then(function (result) {
                    data.inData.fromUserName = result.firstname + " " + result.lastname;
                    callback(null);
                }).catch(function (err) {
                    callback("ERROR");
                })
            } else {
                callback("ERROR");
            }
        }, function (err) {
            res.json(lib.returnmessage.json_success(retObj));
        })
    }


}

