const fs = require('fs'),
    async = require('async'),
    _ = require('lodash'),
    sendMailFunction = require('../../mailAPI/sendmail.js');

exports.startProcess = function (req, res, db, lib) {
    var input ;

    var userprofile = lib.userprofile.getUserProfile();
    var fileReq = req.file;
    if (req.body.jsonData) {
        input = req.body.jsonData;
    } else {
        input = req.body;
    };

    startUpdateDeliverData()
    function startUpdateDeliverData() {
        try {
            var writestream = lib.GridFS.createWriteStream({
                filename: fileReq.filename
            });

            fs.createReadStream("./uploads/" + fileReq.filename).pipe(writestream);
            writestream.on('close', function (file) {
                async.eachSeries(input.payments, function (data, mainCallback) {

                    var query = {
                        collection: "payments",
                        index: {
                            _id: data._id
                        },
                        update: {
                            $set: {
                                deliverData: {
                                    trackingNo: input.trackingNo,
                                    deliverDate: input.deliverDate,
                                    deliverTime: input.deliverTime,
                                    deliverImage: file._id,
                                    deliverType: input.deliverType
                                },
                                status: "2",
                                countTime: new Date()
                            }
                        },
                        option: {}
                    };

                    lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
                        if (err) {
                            mainCallback(err, null);
                        } else {
                            getBuyerData(data, function (err, result) {
                                if (err) {
                                    mainCallback(err, null);
                                } else {
                                    mainCallback(null, "SUCCESS");
                                }
                            });
                        }
                    })
                }, function (err, result) {
                    fs.unlinkSync("./uploads/" + fileReq.filename);
                    res.json(lib.returnmessage.json_success("SUCCESS"));
                })

            });
        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function getBuyerData(payment, callback) {
        db.users.find({
            _id: payment.createByData.createById
        }).then(function (buyerData) {
            console.log(buyerData);

            setNotification(buyerData, payment, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }).catch(function (err) {
            callback(err, null);
        })
    }
    function setNotification(buyerData, payment, callback) {
        var transactionData = {
            type: "Deliver",
            data: {
                transactionNo: payment.transactionNo,
                amount: payment.amount,
                deliverDate: input.deliverDate,
                deliverTime: input.deliverTime,
                status: "2",
                transferDate: "",
                transferTime: "",
                rejectRemark: "",
                description: ""
            }
        };

        saveNotification(transactionData, buyerData, payment, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    };

    function saveNotification(transactionData, buyerData, payment, callback) {
        var arrayForLoop = [];
        arrayForLoop.push(payment.createByData.createById);
        var notificationForSave = new db.notifications({
            toUser: payment.createByData.createById,
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
            sendMailToUser(buyerData, payment, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            });
        }).catch(function (err) {
            callback(err, null);
        })
    };

    function sendMailToUser(buyerData, payment, callback) {

        var tempHtmlBody = '<div align="center">' + '<img src="cid:Header" style="width:50%;">' + '</div>' +
            '<p style="text-align: center; "><font color="#000000">เรียน คุณ ' + payment.createByData.createByFullName + '<br></font ></p>' +
            '<p style="text-align: center;"><font color="#000000">ใบรายการ Transaction หมายเลข : ' + payment.transactionNo + '<br></font ></p>' +
            '<p style="text-align: center;"><font color="#000000">มีการส่งสินค้าถึงคุณแล้ว โดยคุณ : ' + payment.sellerData.sellerFullName + '<br></font ></p>' +
            '<p style="text-align: center;"><font color="#000000">กรุณาตรวจสอบที่ระบบ Middle Trade ขอบคุณค่ะ <br></font ></p>' +
            '<br><br>';

        var dataToSendMail = {
            email: payment.createByData.createByEmail,
            subject: "ผู้ขายส่งสินค้าถึงคุณ",
            filenameLogo: "REGISTER_MAIL.jpg",
            pathLogo: "./www/images/REGISTER_MAIL.jpg",
            htmlbody: tempHtmlBody
        };


        if (buyerData[0].emailNoti) {
            sendMailFunction.sendmail(dataToSendMail, db, lib, function (err, sendMailResult) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, sendMailResult);
                }
            })
        } else {
            callback(null, null);
        }
    };

}