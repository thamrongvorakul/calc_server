exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();
    var search = {
        uid : userprofile._id
    };

    // if (!userprofile.isSeller) {
    //     res.json(lib.returnmessage.json_error_msg("You aren't seller.", "You aren't seller."));
    // }

    findTotalAmount(search);

    function findTotalAmount(search) {
        db.wallets.find(search)
            .then(function (walletResult) {
                res.json(lib.returnmessage.json_success(walletResult));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
}

