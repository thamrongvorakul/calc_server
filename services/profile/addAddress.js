
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    console.log(input);
    startUpdateAddress();

    function startUpdateAddress() {
        db.users.findOneAndUpdate({
            _id: input.uid
        }, {
                $push: {
                    address: input.address
                }
            }).then(function (result) {
                res.json(lib.returnmessage.json_success("SUCCESS"));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }
}