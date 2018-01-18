

var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {};
    search["sellerData.sellerId"] = userprofile._id.toString();
    console.log(search);
    console.log(userprofile);

    setSearchQuery();
    function setSearchQuery() {
        // if (input.search) {
        //     if (input.search.transactionNo) {
        //         search.transactionNo = new RegExp(lib.transform.escapeRegExp(input.search.transactionNo), 'i');
        //     }
        //     if (input.search.email) {
        //         search.serllerData = {};
        //         search.serllerData.sellerEmail = new RegExp(lib.transform.escapeRegExp(input.search.email), 'i');
        //     }
        //     if (input.search.status) {
        //         search.status = new RegExp(lib.transform.escapeRegExp(input.search.status), 'i');
        //     }
        //     if (input.search.dateFrom && !input.search.dateTo) {
        //         search.createDate = {};
        //         search.createDate.$gte = input.search.dateFrom;
        //     }
        //     if (input.search.dateTo && !input.search.dateFrom) {
        //         search.createDate = {};
        //         search.createDate.$lte = input.search.dateTo;
        //     }
        //     if (input.search.dateFrom && input.search.dateTo) {
        //         search.createDate = {};
        //         search.createDate.$gte = input.search.dateFrom;
        //         search.createDate.$lte = input.search.dateTo;
        //     }
        // }
        console.log(search);

        findPayments(search);
    };


    function findPayments(search) {
        db.payments.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagesize).
            limit(input.pagesize + 1)
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

                countPayments(search, objForReturn);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function countPayments(search, paymentsResult) {
        db.payments.count(search).
            then(function (countResult) {
                var retObj = {
                    data: paymentsResult,
                    totalItem: countResult
                };
                res.json(lib.returnmessage.json_success(retObj));
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

