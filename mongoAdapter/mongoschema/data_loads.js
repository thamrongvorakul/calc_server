var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    inputA : Number,
    inputB : Number,
    total : Number,
    type : String,
    savedDate : Date,
    uid : String
});

module.exports = mongoose.model('data_loads', schema , 'data_loads');
