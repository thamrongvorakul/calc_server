var districtData = require('../../province_files/district.json');
exports.startProcess = function (req, res, db, lib) {

    var input = req.body;
    var subProvinceCode = input.subProvinceCode;
    var districtArray = [];

    findDistrictData();

    function findDistrictData() {
        var length = districtData.length;
        for (var i = 0; i < length; i++) {
            var tempdistrictData = districtData[i];
            if (tempdistrictData.subProvinceCode == subProvinceCode) {
                districtArray.push(tempdistrictData);
            }
        }
        responseData(districtArray);
    }

    function responseData(districtArray) {
        res.json(lib.returnmessage.json_success(districtArray));
    }
}