const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input;
    var userprofile = lib.userprofile.getUserProfile();
    var fileReq = req.file;
    
    if (req.body.jsonData) {
        input = req.body.jsonData;
    } else {
        input = req.body;
    };


    startUploadSellerAuthen()
    function startUploadSellerAuthen() {
        try {
            var writestream = lib.GridFS.createWriteStream({
                filename: fileReq.filename
            });

            fs.createReadStream("./uploads/" + fileReq.filename).pipe(writestream);
            writestream.on('close', function (file) {
                fs.unlinkSync("./uploads/" + fileReq.filename);
                findeSellerAuthenRequest(file);
            });
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function findeSellerAuthenRequest(fileInfo) {
        db.seller_authen_requests.find({
            userId: userprofile._id
        }).then(function (sellerAuthenResult) {

            if (sellerAuthenResult.length > 0) {
                updateAuthenRequest(fileInfo, sellerAuthenResult);
            } else {
                insertAuthenRequest(fileInfo);
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function updateAuthenRequest(fileInfo, sellerAuthenResult) {
        db.seller_authen_requests.findOneAndUpdate({
            userId: sellerAuthenResult[0].userId
        }, {
                $set: {
                    authenStatus: "1",
                    authenImage: fileInfo._id,
                    dateCreate: new Date(),
                }
            }).then(function (updateSellerAuthenResult) {
                updateToUser(fileInfo);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }
    function insertAuthenRequest(fileInfo) {
        var queryToSave = {
            collection: "seller_authen_requests",
            data: {
                authenBy: userprofile.firstname + " " + userprofile.lastname,
                dateCreate: new Date(),
                authenStatus: "1",
                authenImage: fileInfo._id,
                telno: userprofile.telno,
                email: userprofile.email,
                userId: userprofile._id
            }
        };

        lib.mongo_query.save(queryToSave, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                updateToUser(fileInfo);
            }
        })
    }
    function updateToUser(fileInfo) {
        var query = {
            collection: "users",
            index: {
                _id: userprofile._id
            },
            update: {
                $set: {
                    sellerAuthenImage: fileInfo._id,
                    sellerAuthenStatus: "1"
                }
            },
            option: {}
        };
        lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                db.users.find({
                    _id: result._id
                }).exec(function (err, userData) {
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg(err, err));
                    } else {
                        res.json(lib.returnmessage.json_success("SUCCESS"));
                    }

                })

            }
        })
    }

}