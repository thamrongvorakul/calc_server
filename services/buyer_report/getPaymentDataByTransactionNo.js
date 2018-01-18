exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        transactionNo: input.data.transactionNo
    };

    findPayments(search);
    function findPayments(search) {
        db.payments.find(search)
            .then(function (paymentsResult) {
                res.json(lib.returnmessage.json_success(paymentsResult));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

}

