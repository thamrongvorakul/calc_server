exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var now = new Date();

    findNewsData();

    function findNewsData() {
        db.newsandevents.find({
            startDate: {
                $lte: now
            },
            endDate: {
                $gte: now
            }
        }).
            sort({ startDate: -1 }).
            limit(3)
            .then(function (newsResult) {
                res.json(lib.returnmessage.json_success(newsResult));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            });
    };
}

