
var MmBagVal = require('../models/MmBag').MmBagVal;
var bagDb = require('../db/mmbag');


module.exports = function(app) {
    app.get('/', index);
    app.get('/vars', vars);
    app.post('/count', authOrThrow, saveCount);
    app.get('/initData', initData);
}

function initData(req, res) {
    var data = {};
    var a = new Asyncr();
    a.then = function() {
        res.send(200, data);
    }
    bagDb.getGlobalBagSummary(a.with(function(sum) {
        data.globalSummary = sum;

    }));
    if (req.user) {
        bagDb.getUserBagSummary(req.user.UserId, a.with(function(sum) {
            data.userSummary = sum;
        }));
    }
}

function index(req, res) {
    var model = {user:req.user};
    

    res.render('index', model);
}

function saveCount(req, res) {
    var bag = req.body;
    var val = new MmBagVal();

    var vr = val.validate(bag);
    if (Object.keys(vr.hardErrs).length == 0) {
        bag.user = req.user.UserId;
        bagDb.insertBag(bag, function(bag) {
            bagDb.getUserBagSummary(req.user.UserId, function(userSummary) {
                res.send(200, { bag: bag, userSummary: userSummary });
            });


        });
        
    } else {
        res.send(422, vr); //Unprocessable Entity - http://tools.ietf.org/html/rfc4918#section-11.2
    }

    
}

function authOrThrow(req, res, next) {
    //look to see if it's an authenticated user
    if (req.user) {
        next();
    } else {
        //or return 401 with WWW-Authenticate:login.
        res.set('WWW-Authenticate', 'login');
        res.send(401);
    }
}


function vars(req, res) {
    var transformed = [];
    transformed.push({
        sourceName: "req.app.settings"
    });
    toKeyValueArray(req.app.settings, transformed);
    transformed.push({
        sourceName: "process.env"
    });
    toKeyValueArray(process.env, transformed);
    res.render('vars', { stuff: transformed });
}


function toKeyValueArray(obj, arr) {
    for (var key in obj) {

        arr.push({
            key: key,
            value: obj[key].toString()
        });
    }
}


/*
keeps track of async functions and then calls a callback when they've all been envoked.
*/
function Asyncr() {

    this.funcs = 0;

    this.with = function(func) {
        this.funcs++;
        var that = this;
        return function() {
            var rv = func.apply(null, arguments);
            that.funcs--;
            if (that.funcs == 0) {
                that.then();
            }
            return rv;
            
        }
    }

    this.then = function() {};
}