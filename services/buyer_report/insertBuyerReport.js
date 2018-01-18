var fs = require('fs');
var lineApi = require('../../module/LINE_API.js');
var lineMsg = require('../../module/LINE_MESSAGE_CONFIG.js');


exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();

    validateIsPreviousClose();

    function validateIsPreviousClose() {
        db.buyer_reports.find({
            "payment.transactionNo": input.paymentTransactionNo,
            "status": "Processing"
        }).then(function (result) {
            if (result.length > 0) {
                res.json(lib.returnmessage.json_error_msg("กรุณาปิด Problem Report ก่อนหน้า", "กรุณาปิด Problem Report ก่อนหน้า"));
            } else {
                updateCanCountdownStatus();
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg("ERROR", "ERROR"));
        })
    };

    function updateCanCountdownStatus() {
        db.payments.findOneAndUpdate({
            transactionNo: input.paymentTransactionNo
        }, {
                $set: {
                    canCountdown: false
                }
            }).then(function (result) {
                findRunningReportCode();
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg("ERROR", "ERROR"));
            })
    };

    function findRunningReportCode() {
        db.runnings.findOneAndUpdate({
            type: "report"
        }, {
                $inc: {
                    running: 1
                }
            }, { new: true }).then(function (result) {

                var fiveDigits = "00000" + result.running;
                var running = result.prefix + fiveDigits.slice(-5);
                var data = new db.buyer_reports(setDataToInsert(running));
                data.save().then(function (insertResult) {
                    setNotification(insertResult);
                }).catch(function (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                })

                // insertRegisterData(result);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }


    function setNotification(insertResult) {
        var problemData = {
            title: input.title,
            Description: input.messageText,
            transactionNo: input.paymentTransactionNo,
            amount: input.paymentAmount,
            buyerName: input.paymentBuyerName,
            sellerName: input.paymentSerllerName
        };

        saveNotification(problemData, insertResult);
    };

    function saveNotification(problemData, insertResult) {
        var notificationForSave = new db.notifications({
            toUser: input.sellerId,
            news: {},
            problemReport: problemData,
            transaction: {},
            dateCreate: new Date(),
            isNews: false,
            isProblem: true,
            isTransaction: false,
            isRead: false
        });


        notificationForSave.save().then(function (result) {
            db.users.findOne({
                _id: input.sellerId
            }).then(function (userData) {
                console.log(userData.pushBulletKey);
                
                if (userData.pushBulletKey) {
                    sendLineNotification(userData._id, userData.pushBulletKey, lineMsg.buyer_create_report_msg(userprofile.firstname, userprofile.lastname, insertResult.reportNo), '', '', db, lib, function (err, result) {
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
                res.json(lib.returnmessage.json_error_msg("ERROR", "ERROR"));
            })

        }).catch(function (err) {
            console.log(err);
            
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

    function setDataToInsert(dataRunning) {
        var data = {
            reportNo: dataRunning,
            title: input.title,
            uid: userprofile._id,
            payment: {
                amount: input.paymentAmount,
                buyerName: input.paymentBuyerName,
                sellerName: input.paymentSerllerName,
                transactionNo: input.paymentTransactionNo,
                description: input.paymentDescription
            },
            sellerId: input.sellerId,
            buyerId: input.buyerId,
            createdDate: new Date(),
            status: "Processing",
            message: [{
                messageBy: userprofile._id,
                messageText: input.messageText,
                userImage: userprofile.image,
                position: "left",
                timeStamp: new Date()
            }]
        }
        return data;
    }
}