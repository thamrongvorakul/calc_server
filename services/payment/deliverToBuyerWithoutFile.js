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
            if (result.status == '1') {
                startUpdateDeliverData()
            } else {
                res.json(lib.returnmessage.json_error_msg("มีการอัพเดทข้อมูลแล้ว", "มีการอัพเดทข้อมูลแล้ว"));
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function startUpdateDeliverData() {
        try {
            var query = {
                collection: "payments",
                index: {
                    _id: input._id
                },
                update: {
                    $set: {
                        deliverData: {
                            trackingNo: input.trackingNo,
                            deliverDate: input.deliverDate,
                            deliverTime: input.deliverTime,
                            deliverImage: "",
                            deliverType: input.deliverType
                        },
                        status: "2",
                        countDownDate: lib.config.COUNT_DOWN_DATE,
                        systemDeliverDate: new Date()

                    }
                },
                option: {}
            };

            lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
                if (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                } else {
                    getBuyerData();
                }
            })
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function getBuyerData() {
        db.users.find({
            _id: input.createByData.createById
        }).then(function (buyerData) {
            setNotification(buyerData);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function setNotification(buyerData) {
        var transactionData = {
            type: "Deliver",
            data: {
                transactionNo: input.transactionNo,
                amount: input.amount,
                deliverDate: input.deliverDate,
                deliverTime: input.deliverTime,
                status: "2",
                transferDate: "",
                transferTime: "",
                rejectRemark: "",
                description: ""
            }
        };

        saveNotification(transactionData, buyerData);
    };

    function saveNotification(transactionData, buyerData) {
        var arrayForLoop = [];
        arrayForLoop.push(buyerData[0]._id);
        var notificationForSave = new db.notifications({
            toUser: buyerData[0]._id,
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
            if (buyerData[0].pushBulletKey) {
                sendLineNotification(buyerData[0]._id, buyerData[0].pushBulletKey, lineMsg.seller_deliver_msg(userprofile.firstname, userprofile.lastname, transactionData.data.transactionNo, input.deliverType), '', '', db, lib, function (err, result) {
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

}