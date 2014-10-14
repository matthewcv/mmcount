var _ = require('lodash');
var pool = require('./index').connectionPool;
var dbutil = require('./index').util;

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


var bagInsert = "INSERT mmcount.Bags( Red ,Green , Blue ,Orange ,Brown ,Yellow ,Type ,Created , UserId )VALUES  ( @red ,@green ,@blue ,@orange ,@brown ,  @yellow ,@type , SYSUTCDATETIME() ,  @user  ); SELECT BagId, Created from mmcount.Bags where BagId = SCOPE_IDENTITY();";

var totals = "SELECT COUNT(BagId) totalBags, SUM(Red) totalRed, SUM(Green) totalGreen,SUM(Blue) totalBlue,SUM(Orange) totalOrange,SUM(Brown) totalBrown,SUM(Yellow) totalYellow FROM mmcount.Bags";
var totalsForUser = totals + " where UserId = @user";

module.exports = {
    insertBag : function(bag, result) {
        var req = new Request(bagInsert);
        req.addParameter("red", TYPES.Int, bag.red);
        req.addParameter("green", TYPES.Int, bag.green);
        req.addParameter("blue", TYPES.Int, bag.blue);
        req.addParameter("orange", TYPES.Int, bag.orange);
        req.addParameter("brown", TYPES.Int, bag.brown);
        req.addParameter("yellow", TYPES.Int, bag.yellow);
        req.addParameter("type", TYPES.VarChar, bag.type);
        req.addParameter("user", TYPES.Int, bag.user);

        dbutil.getOne(req,function(row) {
            bag.id = row["BagId"].value;
            bag.created = new Date( row["Created"].value + "Z");
            result(bag);
        })

    },

    getGlobalBagSummary:function(result) {
        this.getUserBagSummary(null, result);
    },

    getUserBagSummary:function(userid, result) {
        var req = new Request(userid == null? totals:totalsForUser);
        req.addParameter("user", TYPES.Int, userid);
        dbutil.getOne(req,function(row) {
            result(dbutil.map(row, {
                totalBags: null,
                totalRed: null,
                totalGreen: null,
                totalBlue: null,
                totalOrange: null,
                totalBrown: null,
                totalYellow: null,
            }));
        })
    }

};