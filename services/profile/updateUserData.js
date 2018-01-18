
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();
    var dataToSet = {
        firstname: input.firstname,
        lastname: input.lastname,
        telno: input.telno
    };

    if (userprofile.email === '') {
        dataToSet.email = input.email
    };

    
    startUpdateUserData();


    function startUpdateUserData() {
        
        if (userprofile.email == '') {
            dataToSet.email = input.email;
        }

        var query = {
            collection: "users",
            index: {
                _id: userprofile._id
            },
            update: {
                $set: dataToSet
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
    }
}