
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;


    var queryToFind = {
        collection: "users",
        search: {},
        sort: {},
        limit: 0,
        skip: 0
    };
    startLogin();

    function startLogin() {
        queryToFind["search"].email = input.email;
        lib.mongo_query.find(queryToFind, db, lib, function (err, userData) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                console.log(userData);

                if (userData.length == 0) {
                    res.json(lib.returnmessage.json_error_msg("การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน", "การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน"));
                } else {
                    checkPassword(userData);
                }
            }
        })
    };

    function checkPassword(userData) {
        queryToFind["search"].password = input.password;

        lib.mongo_query.find(queryToFind, db, lib, function (err, userDataCheck) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                if (userDataCheck.length == 0) {
                    res.json(lib.returnmessage.json_error_msg("การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน", "การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน"));

                } else {
                    var groupOfValidate = {
                        isActive: (userData[0].active),
                        isTruePassword: (userDataCheck.length > 0),
                        isUser: (userDataCheck[0].group == 'user'),
                        isOnline: (userDataCheck[0].online)
                    };
                    validateData(groupOfValidate, userDataCheck);
                }

            }
        })
    };

    function validateData(groupOfValidate, userDataCheck) {
        if (groupOfValidate.isActive) {
            if (groupOfValidate.isTruePassword) {
                if (groupOfValidate.isUser) {
                    res.json(lib.returnmessage.json_success(userDataCheck));
                } else {
                    res.json(lib.returnmessage.json_error_msg("การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน", "การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน"));
                }
            } else {
                res.json(lib.returnmessage.json_error_msg("การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน", "การเข้าสู่ระบบผิดพลาด กรุณาตรวจสอบรหัสผู้ใช้ และรหัสผ่าน"));
            }
        } else {
            res.json(lib.returnmessage.json_error_msg("กรุณายืนยันการสมัครสมาชิก ที่อีเมล์ของท่าน", "กรุณายืนยันการสมัครสมาชิก ที่อีเมล์ของท่าน"));
        }
    };

}