exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();


    startLogoutService();

    function startLogoutService() {
        var query = {
            collection: "users",
            index: {
                _id: userprofile._id
            },
            update: {
                $set: {
                    online: false
                }
            },
            option: {}
        };


        lib.mongo_query.findOneAndUpdate(query, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                res.json(lib.returnmessage.json_success("SUCCESS"));
            }
        })
    };
}