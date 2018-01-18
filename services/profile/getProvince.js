var provinceData = require('../../province_files/province.json');
exports.startProcess = function (req, res, db, lib) {
    res.json(lib.returnmessage.json_success(provinceData));
}