exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var search = {
        toUser: userprofile._id
    };

    console.log(input);

    findNotification(search);


    function findNotification(search) {
        db.notifications.find(search).
            sort({ dateCreate: -1 }).
            skip((input.pagenum - 1) * input.pagesize).
            limit(input.pagesize + 1)
            .then(function (notificationResult) {
                console.log(notificationResult.length);

                countNotification(search, notificationResult);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
    function countNotification(search, notificationResult) {
        db.notifications.count(search).
            then(function (countResult) {
                var retObj = {
                    data: notificationResult,
                    totalItem: countResult
                };
                res.json(lib.returnmessage.json_success(retObj));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
}

