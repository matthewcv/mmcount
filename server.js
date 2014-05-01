
/**
 * Module dependencies.



 */



var express = require('express');
var hbs = require('express-hbs');
var http = require('http');
var path = require('path');
//var less = require('less-middleware');

var config = require('./config');
var db = require('./db');
var app = express();
var auth = require('./auth');

app.engine('hbs', hbs.express3({
    extname:'.hbs'
}));


// all environments
app.set('port', process.env.PORT);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({
        secret: 'fjdkjasdkhjfhf',
        store: db.sessionStore
    }
));
auth.setUp(app);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
//app.use(less({
//        src: __dirname + '/public',
//        compress: false
//    }));



require('./models/serverToBrowser').setUp(app);

require('./routes')(app);
auth.routes(app);

app.use(express.errorHandler());

app.listen(app.get('port'));

//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
