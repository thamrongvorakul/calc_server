exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        $or: [
            {
                "status": "1"
            },
            
            {
                "status": "2"
            }
        ]
    };
    search["createByData.createById"] = userprofile._id.toString();

    findPayments(search);


    function findPayments(search) {
        db.payments.find(search)
            .then(function (paymentsResult) {
                setStatusName(search, paymentsResult);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function setStatusName(search, paymentsResult) {
        db.master_payment_status.find({})
            .then(function (paymentStatus) {
                var objForReturn = JSON.parse(JSON.stringify(paymentsResult));
                for (var i = 0; i < objForReturn.length; i++) {
                    objForReturn[i].statusName = checkStatusTitle(objForReturn[i].status, paymentStatus);
                };
                res.json(lib.returnmessage.json_success(objForReturn));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };


    function checkStatusTitle(code, paymentStatus) {
        for (var i = 0; i < paymentStatus.length; i++) {
            if (code == paymentStatus[i].code) {
                return paymentStatus[i].title;
            }
        };
        return null;

    };
}

