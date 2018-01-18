const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();


    getUserProfile()
    function getUserProfile() {
        try {
            if (header.uid == userprofile._id) {
                var queryToFind = {
                    collection: "users",
                    search: {
                        _id: header.uid
                    },
                    sort: {},
                    limit: 0,
                    skip: 0
                };
                lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg(err, err));
                    } else {
                        findProfileBanksByUID(JSON.parse(JSON.stringify(result)));
                    }
                })
            } else {
                res.json(lib.returnmessage.json_error_msg("session expire", "session expire"));
            }
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }
    };

    function findProfileBanksByUID(profileData) {
        
        db.profile_banks_byUIDs.find({
            uid: profileData[0]._id,
        }).then(function (result) {
            profileData[0].bankAccount = result;
            if (profileData[0].image == undefined || profileData[0].image == '') {
                findBankImage(profileData);
            } else {
                findImage(profileData);
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function findImage(userData) {
        lib.GridFS.findOne({ _id: userData[0].image }, function (err, file) {
            if (err) return res.status(400).send(err);
            if (!file) return res.status(404).send('');


            var readstream = lib.GridFS.createReadStream({
                _id: file._id
            });

            readstream.on("error", function (err) {
                console.log("Got error while processing stream " + err.message);
                res.end();
            });
            var chunks = [];
            readstream.on('data', function (chunk) {
                chunks.push(chunk);
            })
            readstream.on('end', function (chunk) {
                var result = Buffer.concat(chunks);
                var retObj = JSON.parse(JSON.stringify(userData));
                retObj[0].imageData = result.toString('base64');
                findBankImage(retObj);
            })
        })
    };

    function findBankImage(retObj) {
        var retObjTemp = JSON.parse(JSON.stringify(retObj));

        async.each(retObjTemp[0].bankAccount, function (bank, outCallback) {
            if (bank.bankImage == '') {
                outCallback('', null);
            } else {

                lib.GridFS.findOne({ _id: bank.bankImage }, function (err, file) {
                    if (err) outCallback(err, null);
                    if (!file) outCallback(null, '');

                    var readstream = lib.GridFS.createReadStream({
                        _id: file._id
                    });

                    readstream.on("error", function (err) {
                        outCallback("error", null);
                    });
                    var chunks = [];
                    readstream.on('data', function (chunk) {
                        chunks.push(chunk);
                    })
                    readstream.on('end', function (chunk) {
                        var result = Buffer.concat(chunks);
                        var imageData = result.toString('base64');
                        bank.imageData = imageData;

                        outCallback(null, 'success');
                    })
                })
            }

        }, function (err, result) {
            if (err) {
                res.end();
            } else {
                res.send(retObjTemp);
            }
        })

    };

    function indexFunc(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return i;
            }
        }
        return -1;
    };
}