
exports.startProcess = function(req ,res ,db ,lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();
    var password = input.newpassword;
    var oldPassword = input.oldpassword;
    var regExp = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$");
    if (regExp.test(input.newpassword)) {
        findUser(db ,header , function(err , userData){
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                console.log(userData);
                
                // var validatePassword = lib.encrypt.validateHashPassword(oldPassword , userData[0].salt);
                // oldPassword = validatePassword;
                checkSameOldPassword(db , oldPassword , function(err , userResult){
                    if (err) {
                        res.json(lib.returnmessage.json_error_msg(err, err));
                    } else {
                        if (userResult.length == 0 ) {
                            res.json(lib.returnmessage.json_error_msg("รหัสผ่านเก่าไม่ถูกต้อง", "รหัสผ่านเก่าไม่ถูกต้อง"));
                        } else {
                            // var passwordHashData = lib.encrypt.createSaltHashPassword(password);
                            // var salt = passwordHashData.salt;
                            // password = passwordHashData.passwordHash;
                            updatePassword(db , userprofile , password , function(err , updatePasswordResult){
                                if (err) {
                                    res.json(lib.returnmessage.json_error_msg(err, err));
                                } else {
                                    res.json(lib.returnmessage.json_success(updatePasswordResult));
                                }
                            })
                        }
                    }
                })
            }
        })
    } else {
        res.json(lib.returnmessage.json_error_msg("รหัสผ่านต้องประกอบไปด้วยตัวหนังสือภาษาอังกฤษ ตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และไม่ต่ำกว่า 8 หลัก", "รหัสผ่านต้องประกอบไปด้วยตัวหนังสือภาษาอังกฤษ ตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และไม่ต่ำกว่า 8 หลัก"));
    }


}

var findUser = function(db , header , callback) {
    db.users.find({
        _id : header.uid
    }).exec(function(err , result){
        if (err) {
            return callback(err.errors , null);
        } else {
            return callback(null , result);
        }
    })
}
var checkSameOldPassword = function(db , oldPassword , callback) {
    db.users.find({
        password : oldPassword
    }).exec(function(err ,result){
        if (err) {
            return callback(err.errors , null);
        } else {
            return callback(null , result);
        }
    })
}

var updatePassword = function(db , userprofile, password , callback) {
    db.users.findOneAndUpdate({
        _id : userprofile._id
    },{
        $set : {
            password : password
           
        }
    }).exec(function(err , result){
        if (err) {
            callback(err.errors , null);
        } else {
            callback(null , result);
        }
    })
}
