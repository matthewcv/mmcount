

    function MmBag() {
    
            this.red = null;
            this.green = null;
            this.blue = null;
            this.orange = null;
            this.brown = null;
            this.yellow = null;
            this.type = "plain"; //plain, peanut, etc...

        this.created = null;
        this.id = null;

    }


    function MmBagVal() {
        this.validate = function(mmBag) {
            var errObj = {
                hardErrs: {},
                softErrs: {}
            };

            forcePosInt(mmBag, 'red',  errObj.hardErrs);
            forcePosInt(mmBag, 'green', errObj.hardErrs);
            forcePosInt(mmBag, 'blue',  errObj.hardErrs);
            forcePosInt(mmBag, 'orange', errObj.hardErrs);
            forcePosInt(mmBag, 'yellow', errObj.hardErrs);
            forcePosInt(mmBag, 'brown', errObj.hardErrs);

            mustBe(mmBag, "type", ["plain","peanut"], errObj.hardErrs); //must be one of the allowed values

            someRequired(mmBag, ['red', 'green', 'blue', 'orange', 'yellow', 'brown'], errObj.hardErrs);

            if (Object.keys(errObj.hardErrs).length == 0) {
                allRequired(mmBag, ['red','green','blue','orange','yellow','brown'], errObj.softErrs);
            }


            return errObj;
        }

    }

    /*
the property needs to be "inty" and positive and then it'll be converted to an int.
*/
    var posIntRegex = /^\d+$/;

    function forcePosInt(model, prop, errObj) {
        if (!model[prop]) {
            return;
        }
        
        if(!posIntRegex.test(model[prop].toString())) {
            errObj[prop] = 'forcePosInt';
            return;
        }


        model[prop] = parseInt(model[prop]);

    }

    /*
the property value must be one of the allowed values
*/
    function mustBe(model, prop, allowedVals, errObj) {
        for (var i = 0; i < allowedVals.length; i++) {
            if (model[prop] === allowedVals[0]) {
                return;
            }
        }

        errObj[prop] = "mustBe";
    }

/*
a property of a model object is required
*/
    function required(model, prop, errObj) {
        if (model[prop] == null || model[prop] == undefined) {
            errObj[prop] = "required";
        }
    }

    /*
this is a model validation.  all the properties of the model need to have a value
*/
    function allRequired(model, props, errObj) {
        for (var i = 0; i < props.length; i++) {
            var val = model[props[i]];
            if (val == null || val == undefined) {
                errObj["$model"] = 'allRequired';
                return;
            }
        }
    }

    /*another model validation.  some of the properties need to have a value.*/
    function someRequired(model, props, errObj) {
        for (var i = 0; i < props.length; i++) {
            var val = model[props[i]];
            if (!!val) {
                return;
            }
        }
        errObj["$model"] = 'someRequired';

    }

    module.exports.MmBag = MmBag;
    module.exports.MmBagVal = MmBagVal;

    /*
Takes an object that looks like this
{
    totalBags: <int>,
    totalRed: <int>,
    totalGreen: <int>,
    totalBlue: <int>,
    totalOrange: <int>,
    totalBrown: <int>,
    totalYellow: <int>,
}

    and calculates some statistics from it

*/

    module.exports.createStats = function(summaryData) {
        var totalCandies = summaryData.totalRed + summaryData.totalGreen + summaryData.totalBlue +
            summaryData.totalOrange + summaryData.totalBrown + summaryData.totalYellow;
        var stats = {
            totalCandies:totalCandies,
            summary:summaryData
        }
        stats.red = {
            average: summaryData.totalRed / summaryData.totalBags,
            percent: summaryData.totalRed / totalCandies
        }
        stats.green = {
            average: summaryData.totalGreen / summaryData.totalBags,
            percent: summaryData.totalGreen / totalCandies
        }
        stats.blue = {
            average: summaryData.totalBlue / summaryData.totalBags,
            percent: summaryData.totalBlue / totalCandies
        }
        stats.orange = {
            average: summaryData.totalOrange / summaryData.totalBags,
            percent: summaryData.totalOrange / totalCandies
        }
        stats.brown = {
            average: summaryData.totalBrown / summaryData.totalBags,
            percent: summaryData.totalBrown / totalCandies
        }
        stats.yellow = {
            average: summaryData.totalYellow / summaryData.totalBags,
            percent: summaryData.totalYellow / totalCandies
        }
    };



