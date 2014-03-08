$(function() {

    $("input[type=number]").on('blur', function() {
        if (this.validity && this.validity.badInput) {
            this.value = null;
        }
    });


    function apiPost(url, data) {
        return $.ajax(url, {
            contentType:'application/json',
            data:JSON.stringify(data),
            type:'POST'
        });
    }

    function makePieChart(chart, data) {
        
    }

    function ViewModel() {
        this.currentCount = ko.observable( new module.exports.MmBag());

        this.validationResult = ko.observable({hardErrs: {},softErrs: {}}); 

        this.valMessages = {
            
            forcePosInt:"Needs to be a whole number larger than 0.",
            $model: {
                allRequired:"You didn't put in a number for all the colors.  Is that right?",
                someRequired:"You didn't even put any numbers."
            }
        }

        this.sending = false;
        this.addCountJustHappened = ko.observable(false);

        this.userBags = ko.observable();
        this.globalBags = ko.observable();
        this.userBags.subscribe(this.userBagsChanged, this);
        this.globalBags.subscribe(this.globalBagsChanged, this);

        this.userPie = new Chart($("#userPie").get(0).getContext("2d"));
        this.globalPie = new Chart($("#globalPie").get(0).getContext("2d"));

        this.userBagsChanged = function(data) {
            makePieChart(this.userPie, data);
        }

        this.globalBagsChanged = function(data) {
            makePieChart(this.globalPie, data);
        }

        

        this.submitCount = function() {
            

            this.validationResult(validate(this.currentCount()));
            var vr = this.validationResult();
            if (Object.keys(vr.hardErrs).length + Object.keys(vr.softErrs).length == 0) {
                this.doTheSubmit();
            }
        }

        this.submitCountReally = function() {
            this.validationResult(validate(this.currentCount()));
            var vr = this.validationResult();
            if (Object.keys(vr.hardErrs).length == 0) {
                this.doTheSubmit();
            }
        }

        this.theSubmitReturned = function(response) {
            this.currentCount(null);
            this.addCountJustHappened(true);
            var that = this;
            setTimeout(function() {
                that.addCountJustHappened(false);
            }, 5000);

        }

        this.doTheSubmit = function() {
            var that = this;
            if (this.sending) return;
            this.sending = true;
            apiPost('/count', this.currentCount())
            .always(function() {
                //console.dir({ always: arguments });
                that.sending = false;
            })
            .done(this.theSubmitReturned.bind(this))
            .fail(function(xhr) {
                if (xhr.status == 422) {
                    that.validationResult(xhr.responseJSON);
                } else {
                    console.dir({ fail: arguments });
                    alert('crap.  Something terrible happened.  Check the console.');
                }
            });
        }


        this.getInitData = function() {
            var that = this;
            $.getJSON("/initData").done(function(data) {
                that.globalBags(module.exports.createStats(data.globalSummary));
                that.userBags(module.exports.createStats(data.userSummary));

            });
        }
        
    }


    function validate(mmBag) {
        var val = new module.exports.MmBagVal();

        return val.validate(mmBag);
    }



    var vm = new ViewModel();
    vm.getInitData();
    ko.applyBindings(vm,$(".mmcountform")[0]);

});

/** Binding to make content appear with 'fade' effect */
ko.bindingHandlers['fadeInOut'] = {
    'update': function(element, valueAccessor) {
        var options = valueAccessor();
        if (options() ) {
            $(element).fadeIn('slow');
        }
        else {
            $(element).fadeOut('slow');
        }
    }
};