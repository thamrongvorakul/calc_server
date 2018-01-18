exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        toUser: userprofile._id,
        isRead : false
    };

    findNotification(search);
    function findNotification(search) {
        db.notifications.count(search).
            then(function (countResult) {
                res.json(lib.returnmessage.json_success(countResult));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
    
}

