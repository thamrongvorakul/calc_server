
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    startDeleteBankAccount();

    function startDeleteBankAccount() {
        db.profile_banks_byUIDs.remove({
            _id: input._id
        }).then(function (result) {
            res.json(lib.returnmessage.json_success("SUCCESS"));

        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
}