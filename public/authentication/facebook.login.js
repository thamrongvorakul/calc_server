
exports.startProcess = function (req, res, db, lib) {
    var input = req.body;

    startRegister();
    function startRegister() {
        console.log(input);

        var queryToFind = {
            collection: "users",
            search: {
                facebookId: input.id
            },
            sort: {},
            limit: 0,
            skip: 0
        };

        lib.mongo_query.find(queryToFind, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                validateRegister(result);
            }
        })
    };

    function validateRegister(userData) {
        if (userData.length > 0) {
            res.json(lib.returnmessage.json_success(userData));
        } else {
            findRunningSellerCode();
        }
    };

    function findRunningSellerCode() {
        db.runnings.findOneAndUpdate({
            type: "sellercode"
        }, {
                $inc: {
                    running: 1
                }
            }, { new: true }).then(function (result) {
                insertRegisterData(result);
            }).catch(function (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            })
    }


    function insertRegisterData(runningData) {

        var bankAccount = [];
        var emailCheck = "";

        if (input.email) {
            emailCheck = input.email
        };

        var queryToSave = {
            collection: "users",
            data: {
                email: emailCheck,
                firstname: input.first_name,
                lastname: input.last_name,
                active: true,
                group: "user",
                online: false,
                lastlogin: new Date(),
                registerDate: new Date(),
                mailToken: "",
                agreeTerms: true,
                typeOfRegister: "facebook",
                address: [],
                bankAccount: [],
                isSeller: false,
                image: '',
                sellerAuthenStatus: "0",
                sellerAuthenImage: "",
                sellerCode: runningData.prefix + runningData.running.toString(),
                emailNoti: false,
                pushBulletNoti: false,
                autoWithdrawal: false,
                newsAndEventNoti: false,
                systemRegister: false,
                multiRegister: false,
                facebookRegister: true,
                facebookId: input.id
            }
        };

        lib.mongo_query.save(queryToSave, db, lib, function (err, result) {
            if (err) {
                res.json(lib.returnmessage.json_error_msg(err, err));
            } else {
                var retObj = [];
                retObj.push(result);
                res.json(lib.returnmessage.json_success(retObj));
            }
        })
    };



};