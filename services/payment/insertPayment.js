var fs = require('fs');
var _ = require('lodash');


exports.startProcess = function (req, res, db, lib) {
    var input;
    var userprofile = lib.userprofile.getUserProfile();
    var fileReq = req.file;
    
    if (req.body.jsonData) {
        input = req.body.jsonData;
    } else {
        input = req.body;
    };

    if (input.sellerCode == userprofile.sellerCode) {
        res.json(lib.returnmessage.json_error_msg("ไม่มีรหัสผู้ขายนี้", "ไม่มีรหัสผู้ขายนี้"));
    }
    startInsertPayment();

    function startInsertPayment() {
        try {
            if (_.isNumber(parseFloat(input.amount))) {
                var writestream = lib.GridFS.createWriteStream({
                    filename: fileReq.filename
                });

                fs.createReadStream("./uploads/" + fileReq.filename).pipe(writestream);
                writestream.on('close', function (file) {

                    fs.unlinkSync("./uploads/" + fileReq.filename);

                    findSellerData(file);
                });
            } else {
                res.json(lib.returnmessage.json_error_msg("Amount is not a Number.", "Amount is not a Number."));
            }

        } catch (ex) {
            res.json(lib.returnmessage.json_error_msg(ex, ex));
        }

    };

    function findSellerData(fileInfo) {
        db.users.find({
            sellerCode: input.sellerCode
        }).then(function (result) {
            if (result.length == 0) {
                res.json(lib.returnmessage.json_error_msg("ไมพบข้อมูลผู้ขายจากรหัสนี้", "ไมพบข้อมูลผู้ขายจากรหัสนี้"));
            } else {
                input.sellerData = {}
                input.sellerData.sellerId = result[0]._id;
                input.sellerData.sellerFirstName = result[0].firstname;
                input.sellerData.sellerLastName = result[0].lastname;
                input.sellerData.sellerTelNo = result[0].telno;
                input.sellerData.sellerEmail = result[0].email;
                insertPayment(fileInfo)
            }
        }).catch(function (err) {
            
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }

    function insertPayment(fileInfo) {

        var validateMandatory = (input.confirmBot && input.amount && input.sellerId && input.description && input.transferDate && input.transferTime && input.receivedAddress && input.bankToTransfer);
        getRunningNo(function (err, dataReturn) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                input.sellerData.sellerFullName = input.sellerData.sellerFirstName + " " + input.sellerData.sellerLastName;
                var queryToSave = {
                    collection: "payments",
                    data: {
                        transactionNo: "TN" + dataReturn.tempAdded,
                        createByData: {
                            createById: userprofile._id,
                            createByFirstName: userprofile.firstname,
                            createByLastName: userprofile.lastname,
                            createByEmail: userprofile.email,
                            createByFullName: userprofile.firstname + " " + userprofile.lastname,
                            createByTelNo: userprofile.telno
                        },
                        amount: input.amount,
                        sellerData: input.sellerData,
                        description: input.description,
                        transferDate: input.transferDate,
                        transferTime: input.transferTime,
                        deliverData: {
                            trackingNo: "",
                            deliverDate: "",
                            deliverTime: "",
                            deliverImage: "",
                            deliverType: ""
                        },
                        createDate: new Date(),
                        status: "0",
                        receivedAddress: input.receivedAddress,
                        bankToTransfer: input.bankToTransfer,
                        confirmBot: input.confirmBot,
                        slipImage: fileInfo._id,
                        isRefunds : false
                    }
                };

                lib.mongo_query.save(queryToSave, db, lib, function (err, result) {
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg(err, err));
                    } else {
                        updateRunningNo(dataReturn.runningNoAdded);
                    }
                })
            }
        })


    };


    function updateRunningNo(runningNoAdded) {
        var queueData = new db.payment_running_numbers({
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
            collection: "payment_running_numbers",
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