var async = require('async');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    function checkAmountFromPayment() {

        db.payments.findOne({
            "payment.transactionNo": input.data.transactionNo
        }).then(function (result) {
            findWitdrawalConfig(result);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));

        })
    }

    function findWitdrawalConfig() {
        db.configurations.findOne({
            isWithDrawalCost: true
        })
            .then(function (configResult) {
                var obj = setRefundsData(paymentData, configResult);
                var dataForSave = new db.refunds(obj);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    }

    function saveRefundsData() {
       // ทำการ SAVE ด้วย 
    }
    function setRefundsData(paymentData, configData) {
        var data = {
            transactionNo: input.data.transactionNo,
            paymentId: paymentData._id,
            total: parseFloat(paymentData.amount) - configData.withDrawalCost.value,
            creator: "BUYER",
            sellerAccept: false,
            buyerAccept: false,
            accountNo: input.data.accountNo,
            bank: input.data.bank,
            branch: input.data.branch,
            name: input.data.name,
            paymentImage: paymentData.slipImage,
            fee: configData.withDrawalCost.value
        }

        return data;
    }

}

