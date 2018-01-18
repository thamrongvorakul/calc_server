var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name : String,
    cloudSave : Boolean
});

module.exports = mongoose.model('user', schema , 'users');
