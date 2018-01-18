
exports.startProcess = function (req, res, db, lib) {
    var headers = req.headers;
    var userprofile = lib.userprofile.getUserProfile();

    var queryToFind = {
        collection: "user_menu",
        search: {},
        sort: {},
        limit: 0,
        skip: 0
    };


    startGetMenu();
    function startGetMenu() {

        queryToFind["search"].type = "main";
        lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                res.json(lib.returnmessage.json_success(result, result));
            }
        })
    }
}