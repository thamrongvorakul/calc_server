const _ = require('lodash'),
    sendMailFunction = require('../../mailAPI/sendmail.js');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;

    var validateMandatoryField = (input.email != '' && input.password != '' && input.firstname != '' && input.lastname != '');
    var validateAgreeTerms = (input.agreeTerms);

    startRegister();
    function startRegister() {
        var queryToFind = {
            collection: "users",
            search: {
                email: input.email
            },
            sort: {},
            limit: 0,
            skip: 0
        };

        lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                validateRegister(result);
            }
        })
    }

    function validateRegister(result) {

        if (result.length > 0) {
            if (result[0].facebookRegister) {
                updateSystemRegister(result);
            } else {
                res.json(lib.returnmessage.json_error_msg("E-mail already exists.", "E-mail already exists."));
            }
        } else {
            if (validateMandatoryField) {
                if (validateAgreeTerms) {
                    findRunningSellerCode();
                } else {
                    res.json(lib.returnmessage.json_error_msg("กรุณาอ่าน และยอมรับเงื่อนไขการใช้งานระบบ", "กรุณาอ่าน และยอมรับเงื่อนไขการใช้งานระบบ"));
                }
            } else {
                res.json(lib.returnmessage.json_error_msg("กรุณากรอกข้อมูลให้ครบถ้วน", "กรุณากรอกข้อมูลให้ครบถ้วน"));

            }
        }
    }

    function updateSystemRegister(result) {
        db.users.findOneAndUpdate({
            _id: result[0]._id
        }, {
                $set: {
                    password: input.password,
                    agreeTerms: input.agreeTerms,
                    systemRegister: true,
                }
            }).then(function (result) {
                res.json(lib.returnmessage.json_success("สมัครสมาชิกสำเร็จ", "สมัครสมาชิกสำเร็จ"));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    };

    function findRunningSellerCode() {
        db.runnings.findOneAndUpdate({
            type: "sellercode"
        }, {
                $inc: {
                    running: 1
                }
            }, { new: true }).then(function (result) {
                insertRegisterData(result);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }

    function insertRegisterData(runningData) {
        var mailToken = lib.generateToken.genMailToken(lib);

        var bankAccount = [];
        var queryToSave = {
            collection: "users",
            data: {
                email: input.email,
                password: input.password,
                firstname: input.firstname,
                lastname: input.lastname,
                active: false,
                group: "user",
                online: false,
                lastlogin: new Date(),
                registerDate: new Date(),
                mailToken: mailToken,
                agreeTerms: input.agreeTerms,
                typeOfRegister: "system",
                address: [],
                bankAccount: [],
                isSeller: false,
                sellerAuthenStatus: "0",
                sellerAuthenImage: "",
                sellerCode: runningData.prefix + runningData.running.toString(),
                image: '',
                emailNoti: false,
                pushBulletNoti: false,
                autoWithdrawal: false,
                newsAndEventNoti: false,
                systemRegister: true,
                multiRegister: false,
                facebookRegister: false,
                facebookId: ""
            }
        };

        lib.mongo_query.save(queryToSave, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                console.log(result);

                sendMailToUser(result._id, mailToken, input);
            }
        })
    }

    function sendMailToUser(uid, mailToken, input) {

        var tempHtmlBody = '<div align="center">' + '<img src="cid:Header" style="width:50%;">' + '</div>' +
            '<p style="text-align: center; "><font color="#000000">ขอขอบคุณ คุณ ' + input.firstname + ' ' + input.lastname + ' ที่สมัครสมาชิกเพื่อใช้บริการของเรา : ' + '<br></font ></p>' +
            '<p style="text-align: center;"><font color="#000000">กรุณายืนยันการสมัครสมาชิก โดยการกดที่ลิงค์ด้านล่าง<br></font ></p>' +
            '<p style="text-align: center;"><a href="http://203.170.129.80:3443/public/authentication/mail_active_user/' + uid + '/' + mailToken + '"' +
            ' >' + "ยืนยันการสมัครสมาชิก" + '</a></p>' +
            '<br><br>';

        var data = {
            email: input.email,
            subject: "ยืนยันการสมัครสมาชิก Mettle Trade",
            filenameLogo: "REGISTER_MAIL.jpg",
            pathLogo: "./www/images/REGISTER_MAIL.jpg",
            htmlbody: tempHtmlBody
        };

        sendMailFunction.sendmail(data, db, lib, function (err, sendMailResult) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg("Mail Server Failed.", "Mail Server Failed."));
            } else {
                res.json(lib.returnmessage.json_success("สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล์ของท่าน เพื่อทำการยืนยันการใช้งาน", "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล์ของท่าน เพื่อทำการยืนยันการใช้งาน"));
            }
        })
    };

};