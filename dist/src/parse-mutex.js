"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var namespace = '_ParseMutex';
var ParseMutex = /** @class */ (function () {
    function ParseMutex(databaseURI, dbName) {
        this.databaseURI = databaseURI;
        this.dbName = dbName;
        this.connection = this.connect();
        this.setupCollection();
    }
    ParseMutex.prototype.lock = function (key, callback) {
        this.execute(function (db) {
            db.collection(namespace, { strict: true }, function (error, collection) {
                if (error) {
                    throw error;
                }
                collection.insertOne({ key: key })
                    .then(function () {
                    callback();
                    setTimeout(function () {
                        collection.deleteOne({ key: key });
                    }, 1000);
                })
                    .catch(function () { });
            });
        });
    };
    ParseMutex.prototype.execute = function (callback) {
        this.connection
            .then(function (db) { return callback(db); })
            .catch(function (reason) { throw new Error(reason); });
    };
    ParseMutex.prototype.connect = function () {
        var _this = this;
        var client = new mongodb_1.MongoClient(this.databaseURI, {
            useNewUrlParser: true
        });
        return new Promise(function (resolve, reject) {
            client.connect()
                .then(function (clientHandler) {
                resolve(clientHandler.db(_this.dbName));
            })
                .catch(function (reason) {
                reject(reason);
            });
        });
    };
    ParseMutex.prototype.setupCollection = function () {
        this.execute(function (db) {
            db.collection(namespace, { strict: true }, function (error) {
                if (error) {
                    db.createCollection(namespace)
                        .then(function () { return db.createIndex(namespace, 'key', { unique: true }); })
                        .catch(function (reason) { throw new Error(reason); });
                }
            });
        });
    };
    return ParseMutex;
}());
exports.default = ParseMutex;
//# sourceMappingURL=parse-mutex.js.map