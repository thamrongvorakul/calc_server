exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();


    findMoneyWalletData();

    function findMoneyWalletData() {
        db.wallets.find({
            uid: userprofile._id
        }).then(function (result) {
            if (parseFloat(input.withAmount) > parseFloat(result[0].amount)) {
                res.json(lib.returnmessage.json_error_msg("ยอดเงินคงเหลือของคุณไม่เพียงพอ", "ยอดเงินคงเหลือของคุณไม่เพียงพอ"));
            } else {
                insertWalletTracking(result);
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function insertWalletTracking(walletData) {
        getRunningNo(function (err, dataReturn) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                var queryToSave = {
                    collection: "withdrawals",
                    data: {
                        uid: userprofile._id,
                        referenceNo: "WTD" + dataReturn.tempAdded,
                        status: "0",
                        bankToTransfer: {
                            accountNo: input.bankToTransfer.accountNo,
                            name: input.bankToTransfer.name,
                            branch: input.bankToTransfer.branch,
                            engName: input.bankToTransfer.engName,
                            thaiName: input.bankToTransfer.thaiName,
                            bankImage: input.bankToTransfer.bankImage
                        },
                        withAmount: input.withAmount,
                        createdDate: new Date(),
                        isAgreeTerms: input.isAgreeTerms
                    }
                };

                lib.mongo_query.save(queryToSave, db, lib, function (err, result) {
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg(err, err));
                    } else {
                        updateMoneyInWallt(result,walletData,dataReturn.runningNoAdded)
                    }
                })
            }
        })
    };

    function updateMoneyInWallt(withdrawalData, walletData , runningNoAdded) {
        var amountAfterDecrement = parseFloat(walletData[0].amount) - parseFloat(input.withAmount);
        
        db.wallets.findOneAndUpdate({
            uid: userprofile._id
        }, {
                $set: {
                    amount: amountAfterDecrement
                }
            }).then(function (result) {
                updateRunningNo(runningNoAdded);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    };

    function updateRunningNo(runningNoAdded) {
        var queueData = new db.withdrawal_running_numbers({
            runningNo: runningNoAdded
        });
        queueData.save().then(function (result) {
            res.json(lib.returnmessage.json_success("Success"));
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };
    function getRunningNo(callback) {
        var queryToFind = {
            collection: "withdrawal_running_numbers",
            search: {},
            sort: { _id: -1 },
            limit: 0,
            skip: 0
        };
        lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                var runningNo = "00000";
                var runningno = "0";
                var queueLength = result[0].runningNo.length;
                var runningNoAdded = parseInt(result[0].runningNo) + 1;
                var substrValue = runningNo.length - queueLength;
                var tempRunningNo = runningNo.substring(0, substrValue);
                var tempAdded = tempRunningNo + runningNoAdded.toString();
                if (tempAdded.length > 5) {
                    tempAdded = tempAdded.substring(1, 6);
                };

                var retObj = {
                    tempAdded: tempAdded,
                    runningNoAdded: runningNoAdded
                };
                callback(null, retObj);
            }
        })

    }
}