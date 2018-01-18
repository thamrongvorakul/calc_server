exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();

    startGetSystemBanks();

    function startGetSystemBanks() {
        db.users.findOne({
            sellerCode: input.sellerCode
        }, "firstname lastname email telno sellerAuthenImage")
            .then(function (result) {
                console.log(result);

                if (result) {
                    if (input.sellerCode == userprofile.sellerCode) {
                        res.json(lib.returnmessage.json_success("NODATA"));
                    } else {
                        var retObj = JSON.parse(JSON.stringify(result));
                        findSellerImage(retObj);
                    }
                } else {
                    res.json(lib.returnmessage.json_success("NODATA"));
                }

            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })

    };

    function findSellerImage(retObj) {
        if (retObj.image != '') {
            retObj.imageData = "";
            res.json(lib.returnmessage.json_success(retObj));
        } else {
            lib.GridFS.findOne({ _id: retObj.image }, function (err, file) {
                if (err) outCallback(err, null);
                if (!file) outCallback(null, '');


                var readstream = lib.GridFS.createReadStream({
                    _id: file._id
                });

                readstream.on("error", function (err) {
                    outCallback("error", null);
                });
                var chunks = [];
                readstream.on('data', function (chunk) {
                    chunks.push(chunk);
                })
                readstream.on('end', function (chunk) {
                    var result = Buffer.concat(chunks);
                    var imageData = result.toString('base64');
                    retObj.imageData = imageData;
                    res.json(lib.returnmessage.json_success(retObj));
                })
            })
        }



    };
    function indexFunc(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return i;
            }
        }
        return -1;
    };
}