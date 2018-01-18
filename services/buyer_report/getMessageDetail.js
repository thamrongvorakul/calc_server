const async = require('async'),
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;


    getMessageDetail();
    function getMessageDetail() {
        db.buyer_reports.find({
            _id: input._id
        }).then(function (reportResult) {
            
            startSetImageByMessage(reportResult);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function startSetImageByMessage(reportResult) {
        var reportObj = JSON.parse(JSON.stringify(reportResult[0]));

        async.eachSeries(reportObj.message, function (data, mainCallback) {

            var index = indexFunc(reportObj.message, "_id", data._id);
            getUserData(data.messageBy, function (err, name) {
                if (err) {
                    mainCallback(err, null);
                } else {
                    reportObj.message[index].messageByName = name;
                    mainCallback(null, reportObj);
                }
            })

        }, function (err, result) {
            res.json(lib.returnmessage.json_success(reportObj));
        })

    };

    function getUserData(userId, callback) {
        db.users.find({
            _id: userId
        }).then(function (result) {
            var name = result[0].firstname + " " + result[0].lastname;
            callback(null, name);
        }).catch(function (err) {
            callback(err, null);
        })
    }

    function indexFunc(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return i;
            }
        }
        return -1;
    };
}