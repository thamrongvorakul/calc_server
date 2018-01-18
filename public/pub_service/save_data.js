exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var now = new Date();


    insertData();
    function insertData() {
        input.savedDate = new Date();
        var data = new db.data_loads(input);
        data.save().then(function (result) {
            res.json({ ERROR: "200", MESSAGE: "User saved.", DATA: result });
        }).catch(function (err) {
            res.json({ ERROR: "500", MESSAGE: "FAILED", DATA: {} });
        })
    }
}

