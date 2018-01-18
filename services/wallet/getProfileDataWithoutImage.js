const fs = require('fs'),
ObjectId = require('mongodb').ObjectID,
async = require('async');

exports.startProcess = function (req, res, db, lib) {
var header = req.headers;
var userprofile = lib.userprofile.getUserProfile();


getUserProfile()
function getUserProfile() {
    try {
        if (header.uid == userprofile._id) {
            var queryToFind = {
                collection: "users",
                search: {
                    _id: header.uid
                },
                sort: {},
                limit: 0,
                skip: 0
            };
            lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
                if (err) {
                    res.json(lib.returnmessage.json_error_msg(err, err));
                } else {
                    findProfileBanksByUID(JSON.parse(JSON.stringify(result)));
                }
            })
        } else {
            res.json(lib.returnmessage.json_error_msg("session expire", "session expire"));
        }
    } catch (ex) {
        res.json(lib.returnmessage.json_error_msg(ex, ex));
    }
};

function findProfileBanksByUID(profileData) {
    
    db.profile_banks_byUIDs.find({
        uid: profileData[0]._id,
    }).then(function (result) {
        profileData[0].bankAccount = result;
        res.json(lib.returnmessage.json_success(profileData));
    }).catch(function (err) {
        res.json(lib.returnmessage.json_error_msg(err, err));
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