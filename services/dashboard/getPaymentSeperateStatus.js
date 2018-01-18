var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        $or: [
            {
                "createByData.createById": userprofile._id
            },
            {
                "sellerData.sellerId": userprofile._id
            }
        ]
    };

    findHistory(search);

    function findHistory(search) {

        db.histories.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagecount).
            limit(input.pagecount)
            .then(function (withdrawalResult) {
                var retObj = JSON.parse(JSON.stringify(withdrawalResult));
                getInDataFormIdName(retObj);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function getInDataFormIdName(retObj) {
        var retObj = [
            { key: "waitingfordeliver", status: '1' },
            { key: "deliveredtobuyer", status: '2' },
            { key: "rejected", status: '4' },
            { key: "goodsreceived", status: '3' },
            { key: "adminchecking", status: '0' },
        ]

        async.eachSeries(retObj, function (data, callback) {
            search.status = data.status;
            console.log(search);

            db.payments.count(search)
                .then(function (countResult) {
                    console.log(countResult);

                    data.count = countResult;
                    callback(null, countResult)
                }).catch(function (err) {
                    callback(err, null)
                });
        }, function (err, result) {
            res.json(lib.returnmessage.json_success(retObj));
        })
    }


}

