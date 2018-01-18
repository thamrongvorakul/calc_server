exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();
    
    findProfileBanks();

    function findProfileBanks() {
        db.profile_banks.find({})
            .then(function (result) {
                var retObj = JSON.parse(JSON.stringify(result));
                for (var i = 0 ; i < retObj.length ; i++) {
                    delete retObj[i]._id;
                }
                res.json(lib.returnmessage.json_success(retObj));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
}

