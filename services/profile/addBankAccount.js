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
    startUpdateBankAccount();
    function startUpdateBankAccount() {
        try {
            var writestream = lib.GridFS.createWriteStream({
                filename: fileReq.filename
            });

            fs.createReadStream("./uploads/" + fileReq.filename).pipe(writestream);
            writestream.on('close', function (file) {
                fs.unlinkSync("./uploads/" + fileReq.filename);
                saveBank(file);
            });
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function saveBank(fileInfo) {
        var dataToSave = setBankDataFor(fileInfo);
        dataToSave.save().then(function (result) {
            res.json(lib.returnmessage.json_success(result));
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function setBankDataFor(fileInfo) {

        var data = new db.profile_banks_byUID_requests({
            requestername : userprofile.firstname + " " + userprofile.lastname,
            uid : userprofile._id,
            accountNo: input.accountNo,
            name: input.name,
            branch: input.branch,
            bankImage: fileInfo._id,
            bank: input.bank,
            statusActive: "WAITING",
            createdDate : new Date(),
            requesterAuthenImage : userprofile.sellerAuthenImage
        })

        return data;
    }
}