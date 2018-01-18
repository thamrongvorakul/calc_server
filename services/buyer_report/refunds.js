const async = require('async'),
    _ = require('lodash');

exports.startProcess = function (req, res, db, lib) {
    var input = req.body;
    var userprofile = lib.userprofile.getUserProfile();
    
    function findPayment() {
        db.payments.findOne({
            paymentId : input.paymentId
        }).then(function(result){
            var creator = findForcheckCreator(paymentData);

        }).catch(function(err){

        })
    }

    
    function findForcheckCreator(paymentData) {
        if (userprofile._id == paymentData.createByData.createById) {
            return "BUYER"
        } else if (userprofile._id == paymentData.sellerData.sellerId) {
            return "SELLER"
        }
    }

}