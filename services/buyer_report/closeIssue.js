var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    closeIssue();
    function closeIssue() {
        db.buyer_reports.findOneAndUpdate({
            _id: input.data._id,
            status : "Processing"
        }, {
                $set: {
                    status: "Closed"
                }
            }, { new: true })
            .then(function (closeResult) {
                setCanCountDown(closeResult);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg("FAILED OF STEPS.", "FAILED OF STEPS."));
            });
    };

    function setCanCountDown(closeResult) {
        
        db.payments.findOneAndUpdate({
            transactionNo: closeResult.payment.transactionNo
        }, {
                $set: {
                    canCountdown: true
                }
            }).then(function (closeResult) {
                res.json(lib.returnmessage.json_success("CLOSED"));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    }
}

