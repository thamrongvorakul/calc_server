exports.startProcess = function (req, res, db, lib) {
    var input = req.body;

    startGetShippingType();

    function startGetShippingType() {
        db.master_shipping_type.find({})
            .then(function (result) {
                res.json(lib.returnmessage.json_success(result));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    };
}