const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input;
    var userprofile = lib.userprofile.getUserProfile();
    var fileReq = req.file;

    if (req.body.jsonData) {
        input = req.body.jsonData;
    } else {
        input = req.body;
    };


    removeFileInGridFs()

    function removeFileInGridFs() {
        lib.GridFS.remove({ _id: input.bankImage }, function (err) {
            if (err) res.json(lib.message.error(err))
            startUpdateBankAccount();
        })
    }

    function startUpdateBankAccount() {
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

        db.profile_banks_byUIDs.findOneAndUpdate({
            _id: input._id
        }, {
                bankImage: fileInfo._id,
                branch: input.branch,
                name: input.name,
                accountNo: input.accountNo,

            }).then(function (result) {
                res.json(lib.returnmessage.json_success(result));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }



}