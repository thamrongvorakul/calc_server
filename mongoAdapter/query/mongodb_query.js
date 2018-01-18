

module.exports = {

    save: function (query, db, lib, callback) {

        var data = new db[query.collection](query.data);
        data.save(function (err, result) {
            if (err) {
                callback(err.errors, null);
            } else {
                callback(null, result);
            }
        })
    },

    find: function (query, db, lib, callback) {
        db[query.collection].find(query.search)
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit)
            .exec(function (err, result) {
                if (err) {
                    callback(err.errors, null)
                } else {
                    callback(null, result)
                }
            })
    },

    findOneAndUpdate: function (query, db, lib, callback) {
        db[query.collection].findOneAndUpdate(query.index, query.update, query.option)
            .then(function (result) {
                callback(null, result);
            }).catch(function (err) {
                callback(err, null);
            })
    }

}