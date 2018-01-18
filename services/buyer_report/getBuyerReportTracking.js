var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        $or: [
            {
                uid: userprofile._id.toString()
            },
            {
                sellerId: userprofile._id.toString()
            }
        ]
    };
    setSearchQuery();
    function setSearchQuery() {
        if (input.search) {
            if (input.search.reportNo) {
                search.reportNo = new RegExp(lib.transform.escapeRegExp(input.search.reportNo), 'i');
            }
            if (input.search.email) {
                search.payment = {};
                search.payment.transactionNo = new RegExp(lib.transform.escapeRegExp(input.search.email), 'i');
            }
        }
        findBuyerReport(search);
    };


    function findBuyerReport(search) {
        db.buyer_reports.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagecount).
            limit(input.pagecount)
            .then(function (buyerReportResult) {
                findNameOfSellerId(search, buyerReportResult);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function findNameOfSellerId(search, buyerReportResult) {
        async.eachSeries(buyerReportResult, function (data, callback) {
            db.users.findOne({
                _id : data.sellerId
            }).lean()
            .then(function(result){
                data.sellerName = result.firstname + " " + result.lastname;
                callback(null , result);
            }).catch(function(err){
                callback(err , null);
            })
        }, function (err, result) {
            countBuyerReport(search, buyerReportResult);
        })
    }
    function countBuyerReport(search, buyerReportResult) {
        db.buyer_reports.count(search).
            then(function (countResult) {
                var retObj = {
                    data: buyerReportResult,
                    totalItem: countResult
                };
                res.json(lib.returnmessage.json_success(retObj));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

   
}

