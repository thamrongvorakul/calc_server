var getToken = require('../../module/generateToken.js');

exports.startProcess = function(req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    
    var token = getToken.start(lib);
    
    updateUser(db , input , token , function(err , updateUserResult){
        if (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        } else {
            findUser(db , input , function(err , userResult) {
                if (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                } else {
                    res.json(lib.returnmessage.json_success(userResult[0]));
                }
            })
        }
    })

}

var updateUser = function(db , input , token ,callback) {
    db.users.findOneAndUpdate({
        email : input.email
    },{
        $set : {
            ucode : token,
            online : true,
            lastlogin : new Date()
        }
    }).exec(function(err , result){
        if (err) {
            return callback(err.errors , null);
        } else {
            return callback(null , result);
        }
    })
}
var findUser = function(db, input, callback) {
    db.users.find({
        email : input.email
    },"-password").exec(function(err , result){
        if (err) {
            return callback(err.errors , null);
        } else {
            return callback(null , result);
        }
    })
}
