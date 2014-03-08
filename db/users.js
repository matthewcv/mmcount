var _ = require('lodash');
var pool = require('./index').connectionPool;
var dbutil = require('./index').util;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var ids = {
    UserId:TYPES.Int,
    GoogleId:TYPES.VarChar, 
    FacebookId:TYPES.VarChar, 
    TwitterId:TYPES.VarChar
    };
var User = require('../models/user');
var providers = User.providers;
module.exports = {


    /*
        find a user by one of the id columns UserId, GoogleId, FacebookId, TwitterId, etc.
        query object should have the idcolumn and the value
        {UserId:21378} or {GoogleId:'30982309884289'}, etc.
        result is a function that takes the user as the argument.  Null if the user not found.
    */
    findUser: function(query, result) {
        var idCol = _.first(_.intersection(Object.keys(query), Object.keys(ids)));
        var idVal = query[idCol];

        var req = new Request("SELECT * FROM dbo.Users WHERE " + idCol + " = @ID");
        req.addParameter("ID", ids[idCol], idVal);

        dbutil.getOne(req, function(row) {
            var user = null;
            if (row) {
                user = new User();
                dbutil.map(row, user, ["ProfileData"]);
            }
            result(user);
        });
    },

    getOrCreateUserFromOAuthProfile: function(profile, result) {
        var that = this;
        that.findUser(getFindQuery(profile), function(user) {
            if (user) {
                result(user);
            } else {
                that.createUserFromOAuthProfile(profile, result);
            }
        });
    },

    createUserFromOAuthProfile:function(profile, result) {
        var user = User.fromOauthProfile(profile);
        var sql = "INSERT Users(" + providers[profile.provider] + ",ProfileData, Created) VALUES (@profileId,@profileData,SYSUTCDATETIME()); SELECT UserId, Created from Users where UserId = SCOPE_IDENTITY();";
        var req = new Request(sql);
        req.addParameter("profileId", TYPES.VarChar, profile.id);
        req.addParameter("profileData", TYPES.VarChar, JSON.stringify(user.ProfileData));

        dbutil.getOne(req,function(row) {
            dbutil.map(row, user);
            result(user);
        })
    },

    setUserLoggedInNow:function(user, result) {
        var sql = "UPDATE Users SET LastLogin = SYSUTCDATETIME() WHERE UserId = @userId; SELECT LastLogin from Users WHERE UserId = @userId";
        var req = new Request(sql);
        req.addParameter("userId", TYPES.Int, user.UserId);

        dbutil.getOne(req,function(row) {
            user.LastLogin = row["LastLogin"].value;
            result(user);
        })
    }

}

function getFindQuery(profile) {
    var query = {};
    query[providers[profile.provider]] = profile.id;
    return query;
}




