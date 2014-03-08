var TdsPool = require('tedious-connection-pool');
var tds = require('tedious');
var express = require('express');
var SessionStore = require('./connect-tedious')(express);
var config = require('../config');
var sitePool = new TdsPool({}, config.database);
var _ = require('lodash');


module.exports.connectionPool = sitePool;
module.exports.sessionStore = new SessionStore({ pool: sitePool });

module.exports.util = {
    nonQuery: function (request, done) {

    },

    /*
    map a row to an object looking for property name matches.
    row - the row from the database
    object - the object instance to map to
    jsons - an array of property names that should be JSON.parse()'d
    */
    map: function (row, object, jsons) {
        jsons = jsons || [];
        for (key in object) {
            if (row[key]) {
                var val = row[key].value;
                if (_.contains(jsons, key)) {
                    val = JSON.parse(val);
                }
                object[key] = val;
            }
        }
        return object;
    },

    /*
    Execute a query that is expected to return one record.
    request - the request with the query and parameters
    done - function that will take the record or null as the parameter
    */
    getOne: function (request, done) {
        sitePool.requestConnection(function (err, conn) {
            if (err) {
                throw err;
            }

            var rows = [];

            request.userCallback = function (err1, rowCount) {
                conn.close();
                if (err1) {
                    throw err1;
                }

                done(rows.length == 0 ? null : rows[0]);
            };

            request.on('row', function (row) {
                rows.push(row);
            });

            conn.execSql(request);
        });
    }

}