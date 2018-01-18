const fs = require('fs');

exports.startProcess = function (req, res, db, lib) {

    var input = req.params;
    
    startActive();
    function startActive() {
        var query = {
            collection: "users",
            index: {
                _id: input.uid,
                mailToken: input.token,
                active: false
            },
            update: {
                $set: {
                    active: true,
                    mailToken: 'n0t-us3-aga!n'
                }
            },
            option: {}
        };
        lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                responseHTMLFunction(result);
            }
        })
    };

    function responseHTMLFunction(result) {
        if (result) {
            res.sendfile('./public/authentication/success_active.html');
        } else {
            res.sendfile('./public/authentication/already_active.html');
        }
    }

}