exports.startProcess = function (req, res, db, lib) {
    var input = JSON.parse(req.params.json);
    var header = req.headers;
    var now = new Date();

    findData();

    function findData() {
        db.data_loads.find({
            uid: input.uid
        }).then(function (result) {
            res.json({ ERROR: "200", MESSAGE: "GET DATA SUCCESS.", DATA: result });
        }).catch(function (err) {
            res.json({ ERROR: "500", MESSAGE: "FAILED", DATA: {} });
        })
    };
}

