const async = require('async');
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;

    startGetSystemBanks();

    function startGetSystemBanks() {
        var queryToFind = {
            collection: "system_banks",
            search: {},
            sort: {},
            limit: 0,
            skip: 0
        };
        lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                var retObj = JSON.parse(JSON.stringify(result));
                findBankImage(retObj);
            }
        })
    };

    function findBankImage(retObj) {
        async.each(retObj, function (data, outCallback) {
            lib.GridFS.findOne({ _id: data.bankImage }, function (err, file) {
                if (err) outCallback(err, null);
                if (!file) outCallback(null, '');

                console.log(file);
                
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
                    var index = indexFunc(retObj, "engName", data.engName);
                    retObj[index].imageData = imageData;
                    outCallback(null, 'success');
                })
            })
        }, function (err, result) {
            if (err) {
                res.end();
            } else {
                res.send(retObj);
            }
        })

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