
var fs = require('promised-io/fs');
var all = require('promised-io/promise').all;

var handlebars = require('express-hbs').handlebars;
var path = require('path');

module.exports.setUp = function(app) {

    app.get("/models", function(req, res) {
        //req.query.model is an array of the file names.


        getContents(req.query.model, function(template, content) {
            generateOutput(template,content, function(output) {
                res.type('application/javascript');

                //later on think about server caching and browser caching.  
                res.send(output);
                
            })
        });

    });

}

function generateOutput(template, content, haveOutput) {
    var hbtpl = handlebars.compile(template);
    var processed = hbtpl(content);
    haveOutput(processed);
}


function getContents(fileNames, haveContent) {
    if (!Array.isArray(fileNames)) {
        fileNames = [fileNames];
    }

    var promises = [fs.readFile(path.join(__dirname, "browserTemplate.hbs"), { encoding: 'utf8' })];

    fileNames.forEach(function(fileName) {
        promises.push(fs.readFile(path.join(__dirname, fileName + ".js"), { encoding: 'utf8' }));

    });

    all(promises).then(function(files) {
        haveContent(files.shift(), { files: files });
    }, function(err) {
        throw(err);
    });
}