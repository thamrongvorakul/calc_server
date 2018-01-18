exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        uid: userprofile._id
    };

    setSearchQuery();
    function setSearchQuery() {
        if (input.search) {
            if (input.search.referenceNo) {
                search.referenceNo = new RegExp(lib.transform.escapeRegExp(input.search.referenceNo), 'i');
            }

            if (input.search.status) {
                search.status = new RegExp(lib.transform.escapeRegExp(input.search.status), 'i');
            }

            if (input.search.accountNo) {
                search["bankToTransfer.accountNo"] = new RegExp(lib.transform.escapeRegExp(input.search.accountNo), 'i')
            }
        }
        
        findWithdrawalData(search);
    };


    function findWithdrawalData(search) {
        db.withdrawals.find(search).
            sort(input.sort).
            skip((input.pagenum - 1) * input.pagecount).
            limit(input.pagecount)
            .then(function (withdrawalResult) {
                countPayments(search, withdrawalResult);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

    function countPayments(search, withdrawalResult) {
        db.withdrawals.count(search).
            then(function (countResult) {
                var retObj = {
                    data: withdrawalResult,
                    totalItem: countResult
                };
                res.json(lib.returnmessage.json_success(retObj));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };

}

