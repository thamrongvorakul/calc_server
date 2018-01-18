const async = require('async'),
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;

    getViewImage();
    function getViewImage() {
        db.withdrawals.find({
            _id: input._id
        }).then(function (withdrawalResult) {
            getWithdrawalImage(withdrawalResult);
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    };

    function getWithdrawalImage(withdrawalResult) {
        getImageData(withdrawalResult[0].bankToTransfer.bankImage, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                responseToClient(result);
            }
        });
    };


    function getImageData(imageId, callback) {
        lib.GridFS.findOne({ _id: imageId }, function (err, file) {
            console.log(file);
            
            if (err) return res.status(400).send(err);
            if (!file) return res.status(404).send('');

            var readstream = lib.GridFS.createReadStream({
                _id: file._id
            });

            readstream.on("error", function (err) {
                console.log("Got error while processing stream " + err.message);
                res.end();
            });

            var chunks = [];
            readstream.on('data', function (chunk) {
                chunks.push(chunk);
            })
            readstream.on('end', function (chunk) {
                var result = Buffer.concat(chunks);
                callback(null, result.toString('base64'));
            })
        })
    };

    function responseToClient(dataResponse) {
        res.send(dataResponse);
    }
}