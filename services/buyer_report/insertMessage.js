var fs = require('fs');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();

    findBuyerReport();
    function findBuyerReport() {
        db.buyer_reports.find({
            _id: input._id
        }).then(function (result) {
            if (result[0].status == 'Closed') {
                res.json(lib.returnmessage.json_error_msg("ไม่สามารถดำเนินการได้", "ไม่สามารถดำเนินการได้"));
            } else {
                addMessage(result);
            }
        }).catch(function (err) {
            res.json(lib.returnmessage.json_error_msg(err, err));
        })
    }
    function addMessage(buyerReportResult) {

        db.buyer_reports.findOneAndUpdate({
            _id: input._id
        }, {
                $push: {
                    message: setDataToInsert(buyerReportResult)
                }
            }).then(function (result) {
                res.json(lib.returnmessage.json_success("SUCCESS"));
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }

    function setDataToInsert(buyerReportResult) {

        var position = '';
        var lastLength = buyerReportResult[0].message.length - 1;
        if (buyerReportResult[0].message[lastLength].position == "left") {
            position = "right";
        } else {
            position = "left";
        }

        if (buyerReportResult[0].message[lastLength].messageBy == userprofile._id) {
            position = buyerReportResult[0].message[lastLength].position;
        };


        var data = {
            messageBy: userprofile._id,
            messageText: input.messageText,
            userImage: userprofile.image,
            position: position,
            timeStamp: new Date()
        }
        return data;
    }
}