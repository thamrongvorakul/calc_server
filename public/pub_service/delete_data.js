exports.startProcess = function (req, res, db, lib) {
    var input = req.params;
    var header = req.headers;
    var now = new Date();

    deleteData();

    function deleteData() {
        db[input.model].remove({
            _id: input.itemId,
            uid : input.uid
        }).then(function (result) {
            res.json({ ERROR: "200", MESSAGE: "DELETE DATA SUCCESS.", DATA: result });
        }).catch(function (err) {
            console.log(err);
            
            res.json({ ERROR: "500", MESSAGE: "FAILED", DATA: {} });
        })
    };
}

