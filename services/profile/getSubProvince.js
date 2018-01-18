var subProvinceData = require('../../province_files/sub_province.json');
exports.startProcess = function (req, res, db, lib) {

    var input = req.body;
    var provinceCode = input.provinceCode;
    var subProvinceArray = [];

    findSubProvinceData();

    function findSubProvinceData() {
        var length = subProvinceData.length;
        for (var i = 0; i < length; i++) {
            var tempSubprovinceData = subProvinceData[i];
            if (tempSubprovinceData.provinceCode == provinceCode) {
                subProvinceArray.push(tempSubprovinceData);
            }
        }
        responseData(subProvinceArray);
    }

    function responseData(subProvinceArray) {
        res.json(lib.returnmessage.json_success(subProvinceArray));
    }


}