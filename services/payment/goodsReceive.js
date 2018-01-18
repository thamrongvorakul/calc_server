const fs = require('fs'),
    ObjectId = require('mongodb').ObjectID,
    _ = require('lodash'),
    lineApi = require('../../module/LINE_API.js'),
    lineMsg = require('../../module/LINE_MESSAGE_CONFIG.js');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();

    validateStatus()

    function validateStatus() {
        db.payments.findOne({
            _id: input._id
        }).then(function (result) {
            if (result.status == '2') {
                updateToPayments();
            } else {
                res.json(lib.returnmessage.json_error_msg("มีการอัพเดทข้อมูลแล้ว", "มีการอัพเดทข้อมูลแล้ว"));
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }

    function updateToPayments() {
        var query = {
            collection: "payments",
            index: {
                _id: input._id
            },
            update: {
                $set: {
                    status: "3"
                }
            },
            option: {}
        };

        lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                getSllerData(result);
            }
        })
    };

    function getSllerData(paymentData) {
        db.users.find({
            _id: input.sellerData.sellerId
        }).then(function (sellerData) {
            getConfiguration(paymentData, sellerData);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function getConfiguration(paymentData, sellerData) {
        db.configurations.find({
            isFee: true
        }).then(function (configResult) {
            updateSellerWallet(paymentData, sellerData, configResult);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function updateSellerWallet(paymentData, sellerData, configResult) {

        if (paymentData.amount != input.amount) {
            res.json(lib.returnmessage.json_error_msg("ยอดเงินไม่ถูกต้อง", "ยอดเงินไม่ถูกต้อง"));
        } else {
            var percentToUse = checkPercent(configResult[0].fee.stepValue, input.amount);
            var amountForFee = parseFloat(input.amount) * percentToUse;
            var amountForInc = parseFloat(input.amount) - parseFloat(amountForFee);
            db.wallets.findOneAndUpdate({
                uid: sellerData[0]._id,
            }, {
                    $inc: {
                        amount: amountForInc
                    }
                }).then(function (result) {
                    saveHistory(paymentData, amountForInc, sellerData);
                }).catch(function (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                })
        }

    };

    function saveHistory(paymentData, amountForInc, sellerData) {

        var historyForSave = new db.histories({
            uid: sellerData[0]._id,
            referenceNo: '',
            bankToTransfer: '',
            amount: amountForInc,
            timestamp: new Date(),
            type: "in",
            inData: {
                fromUserID: userprofile._id,
                transactionNo: paymentData.transactionNo,
                description: paymentData.description
            }
        });

        historyForSave.save().then(function (result) {
            setNotification(sellerData , amountForInc);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };


    function setNotification(sellerData , amountForInc) {
        var transactionData = {
            type: "GoodsReceive",
            data: {
                transactionNo: input.transactionNo,
                amount: input.amount,
                deliverDate: input.deliverDate,
                deliverTime: input.deliverTime,
                status: "3",
                transferDate: "",
                transferTime: "",
                rejectRemark: "",
                description: ""
            }
        };

        saveNotification(transactionData, sellerData , amountForInc);
    };

    function saveNotification(transactionData, sellerData , amountForInc) {
        var arrayForLoop = [];
        arrayForLoop.push(sellerData[0]._id);
        var notificationForSave = new db.notifications({
            toUser: sellerData[0]._id,
            news: {},
            problemReport: {},
            transaction: transactionData,
            dateCreate: new Date(),
            isNews: false,
            isProblem: false,
            isTransaction: true,
            isRead: false
        });


        notificationForSave.save().then(function (result) {
            if (sellerData[0].pushBulletKey) {
                sendLineNotification(sellerData[0]._id, sellerData[0].pushBulletKey, lineMsg.buyer_goodsreceive_msg(userprofile.firstname, userprofile.lastname, transactionData.data.transactionNo, amountForInc), '', '', db, lib, function (err, result) {
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg("ERROR 506", "ERROR 506"));
                    } else {
                        res.json(lib.returnmessage.json_success("SUCCESS"));
                    }
                });
            } else {
                res.json(lib.returnmessage.json_success("ERROR 401", "ERROR 401"));
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function sendLineNotification(ownerId, accessToken, message, fImage, thImage, db, lib, callback) {
        lineApi.Notification(ownerId, accessToken, message, fImage, thImage, db, lib, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        })
    };

    function checkPercent(stepArr, value) {
        var percentToUse = 0;

        for (var i = 0; i < stepArr.length; i++) {
            if ((parseFloat(value) >= parseFloat(stepArr[i].startRangeValue)) && (parseFloat(value) <= parseFloat(stepArr[i].endRangeValue))) {
                percentToUse = stepArr[i].percent / 100;
            }
        }
        return percentToUse;
    }
}