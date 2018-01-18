const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID;

exports.startProcess = function (req, res, db, lib) {
    var input;
    var userprofile = lib.userprofile.getUserProfile();
    var fileReq = req.file;
    console.log('asdhsajkdhsakdhjksahdkas');
    console.log(fileReq);
    
    if (req.body.jsonData) {
        input = req.body.jsonData;
    } else {
        input = req.body;
    };

    startUploadImage()
    function startUploadImage() {
        try {
            var writestream = lib.GridFS.createWriteStream({
                filename: fileReq.filename
            });

            fs.createReadStream("./uploads/" + fileReq.filename).pipe(writestream);
            writestream.on('close', function (file) {
                fs.unlinkSync("./uploads/" + fileReq.filename);
                updateToUser(file);
            });
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function updateToUser(fileInfo) {
        var query = {
            collection: "users",
            index: {
                _id: userprofile._id
            },
            update: {
                $set: {
                    image: fileInfo._id
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
                    lib.GridFS.findOne({ _id: userData[0].image }, function (err, file) {
                        console.log(file);
                        if (err) return res.status(400).send(err);
                        if (!file) return res.status(404).send('');

                        res.header('Content-Type', file.contentType);
                        res.header('Content-Disposition', 'attachment; filename="' + file.filename + '"');

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
                            res.send(result.toString('base64'));
                        })
                    })

                })

            }
        })
    }

}