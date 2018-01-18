exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    updateNotification();
    function updateNotification() {
        db.notifications.update({
            toUser: userprofile._id
        }, {
                isRead: true
            }, { multi: true }).then(function (result) {
                console.log(result);
                
                res.json(lib.returnmessage.json_success("DONE"));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    };

}

