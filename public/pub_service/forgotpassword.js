const sendMailFunction = require('../../mailAPI/sendmail.js');
var getToken = require('../../module/generateToken.js');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    findUserData()
    function findUserData() {
        db.users.findOne({
            email: input.email
        }).then(function (result) {
            console.log(result);
            
            if (result) {
                updatePassword(result);
            } else {
                res.json(lib.returnmessage.json_error_msg("ERROR 002", "ERROR 002"));
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }

    function updatePassword(userResult) {
        var OTPpassword = getToken.genOTP(lib);

        db.users.findOneAndUpdate({
            _id: userResult._id
        }, {
                $set: {
                    password: OTPpassword
                }
            }).then(function (result) {
                sendMailToUser(userResult, OTPpassword);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }

    function sendMailToUser(userData, OTPpassword) {

        var tempHtmlBody = '<div align="center">' + '<img src="cid:Header" style="width:50%;">' + '</div>' +
            '<p style="text-align: center; "><font color="#000000">เรียน คุณ ' + userData.firstname + ' ' + userData.lastname + '<br></font ></p>' +
            '<p style="text-align: center;"><font color="#000000">รหัสผ่านใหม่ของคุณคือ : ' + OTPpassword + ' <br></font ></p>' +
            '<p style="text-align: center;"><a href="https://mettletrade.com"' +
            ' >' + "ไปยังเว็ปไซต์หลัก" + '</a></p>' +
            '<br><br>';

        var data = {
            email: userData.email,
            subject: "รหัสผ่านใหม่สำหรับเข้าใช้งาน Mettle Trade",
            filenameLogo: "REGISTER_MAIL.jpg",
            pathLogo: "./www/images/REGISTER_MAIL.jpg",
            htmlbody: tempHtmlBody
        };

        sendMailFunction.sendmail(data, db, lib, function (err, sendMailResult) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg("Mail Server Failed.", "Mail Server Failed."));
            } else {
                res.json(lib.returnmessage.json_success("SUCCESS", "SUCCESS"));
            }
        })
    };


}

var updatePassword = function (db, userResult, password, salt, callback) {
    db.user.findOneAndUpdate({
        _id: userResult._id
    }, {
            $set: {
                password: password,
                online: false,
                firsttime: true,
                salt: salt
            }
        }, { new: true }).exec(function (err, result) {
            if (err) {
                return callback(err.errors, null);
            } else {
                return callback(null, result);
            }
        })
}

var findUser = function (db, input, callback) {
    db.user.find({
        email: input.email
    }).exec(function (err, result) {
        if (err) {
            return callback(err.errors, null);
        } else {
            return callback(null, result);
        }
    })
}
