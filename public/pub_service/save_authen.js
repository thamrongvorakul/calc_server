exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var header = req.headers;
    var now = new Date();

    console.log(input);
    
    findUser();

    function findUser() {
        db.users.findOne({
            name: input.name
        }).then(function (result) {
            if (result) {
                res.json({ ERROR: "304", MESSAGE: "User Already Exists." , DATA : result});
            } else {
                insertUser();
            }
        }).catch(function (err) {
            res.json({ ERROR: "500", MESSAGE: "FAILED" , DATA : {}});
        })
    };

    function insertUser() {
        var data = new db.users({
            name : input.name,
            cloudSave : false
        });

        data.save().then(function(result){
            res.json({ ERROR: "200", MESSAGE: "User saved." , DATA : result});
        }).catch(function(err){
            res.json({ ERROR: "500", MESSAGE: "FAILED" , DATA : {}});
        })
    }
}

