var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {};
    search["createByData.createById"] = userprofile._id.toString();
    setSearchQuery();
    function setSearchQuery() {
        if (input.search) {
            if (input.search.transactionNo) {
                search.transactionNo = new RegExp(lib.transform.escapeRegExp(input.search.transactionNo), 'i');
            }
            if (input.search.email) {
                search.serllerData = {};
                search.serllerData.sellerEmail = new RegExp(lib.transform.escapeRegExp(input.search.email), 'i');
            }
            if (input.search.status) {
                search.status = new RegExp(lib.transform.escapeRegExp(input.search.status), 'i');
            }
            if (input.search.dateFrom && !input.search.dateTo) {
                search.transferDate = {};
                search.transferDate.$gte = input.search.dateFrom;
            }
            if (input.search.dateTo && !input.search.dateFrom) {
                search.transferDate = {};
                search.transferDate.$lte = input.search.dateTo;
            }
            if (input.search.dateFrom && input.search.dateTo) {
                search.transferDate = {};
                search.transferDate.$gte = input.search.dateFrom;
                search.transferDate.$lte = input.search.dateTo;
            }
        }
        findPayments(search);
    };


    function findPayments(search) {
        
        db.payments.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagesize).
            limit(input.pagesize +1)
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

    
}

