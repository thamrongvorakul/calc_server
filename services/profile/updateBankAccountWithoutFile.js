const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();
    startUpdateBankAccount()
    function startUpdateBankAccount() {
        try {
            db.profile_banks_byUIDs.findOneAndUpdate({
                _id : input._id
            },{
                branch : input.branch,
                name : input.name,
                accountNo : input.accountNo,
                
            }).then(function(result){
                res.json(lib.returnmessage.json_success(result));
            }).catch(function(err){
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };


}