const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();


    startSaveCommonSettings()
    function startSaveCommonSettings() {
        try {
            var query = {
                collection: "users",
                index: {
                    _id: userprofile._id
                },
                update: {
                    $set: {
                        emailNoti: input.emailNoti,
                        pushBulletNoti: input.pushBulletNoti,
                        autoWithdrawal: input.autoWithdrawal,
                        newsAndEventNoti: input.newsAndEventNoti,
                        pushBulletKey : input.pushBulletKey
                    }
                },
                option: {}
            };

            lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
                if (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                } else {
                    res.json(lib.returnmessage.json_success(result));
                }
            })
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };


}