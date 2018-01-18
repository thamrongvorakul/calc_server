const mongoose = require('mongoose'),
    mongoconf = require('./DB_conf.js'),
    Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;




var dbcredential = "";
var DB_ADAPTER_SCHEMA = {};
var gfs;

module.exports = {
    setUpConnection: function (lib, callback) {

        if (mongoconf.DBUSER && mongoconf.DBPASS) {
            dbcredential = mongoconf.DBUSER + ":" + mongoconf.DBPASS + '@';
        };

        var dbURI = 'mongodb://' + dbcredential + mongoconf.DBHOST + ':' + mongoconf.DBPORT + '/' + mongoconf.DBNAME;

        mongoose.connect(dbURI);
        var conn = mongoose.connection;
        gfs = Grid(conn.db);
        
        mongoose.connection.on('connected', function () {
            console.log("MONGOOSE CONNECT : " + dbURI);
            DB_ADAPTER_SCHEMA.users = require('../mongoschema/users.js');
            DB_ADAPTER_SCHEMA.data_loads = require('../mongoschema/data_loads.js');
            callback(null, { message: "Connected" });
        });

        mongoose.connection.on('error', function (err) {
            console.log("MONGOOSE CONNECT ERROR : " + err);
            callback({ err: "err" }, null);
        });

        mongoose.connection.on('disconnected', function () {
            console.log('MONGOOSE DISCONNECTED');
            callback(null, { message: "Disconnected" });
        });

        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                process.exit(0);
            });
        });
    },
    GET_MONGO_SCHEMA: function () {
        return DB_ADAPTER_SCHEMA;
    },
    GET_GRIDFS_SETUP: function () {
        return gfs;
    }
};
