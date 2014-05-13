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


    function ViewModel(){
        

        }
    
    ViewModel.prototype = {
        currentCount : ko.observable( new module.exports.MmBag()),

        validationResult : ko.observable({hardErrs: {},softErrs: {}}),

        valMessages : {
            
            forcePosInt:"Needs to be a whole number larger than 0.",
            $model: {
                allRequired:"You didn't put in a number for all the colors.  Is that right?",
                someRequired:"You didn't even put any numbers."
            }
        },

        sending: false,
        addCountJustHappened : ko.observable(false),

        userBags : ko.observable(),
        globalBags : ko.observable(),

        statsDisplay: ko.observable(),
                

        submitCount : function() {

            this.validationResult(validate(this.currentCount()));
            var vr = this.validationResult();
            if (Object.keys(vr.hardErrs).length + Object.keys(vr.softErrs).length == 0) {
                this.doTheSubmit();
            }
        },

        submitCountReally : function() {
            this.validationResult(validate(this.currentCount()));
            var vr = this.validationResult();
            if (Object.keys(vr.hardErrs).length == 0) {
                this.doTheSubmit();
            }
        },

        theSubmitReturned : function(response) {
            
            this.currentCount(null);
            this.getInitData();
            this.addCountJustHappened(true);
            var that = this;
            setTimeout(function() {
                that.addCountJustHappened(false);
            }, 5000);

        },

        doTheSubmit :function() {
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
        },


        getInitData : function() {
            var that = this;
            $.getJSON("/initData").done(function(data) {
                
                that.globalBags(module.exports.createStats(data.globalSummary));
                that.userBags(module.exports.createStats(data.userSummary));
                
            });

            
        },

        showStatsPopup:function(ev){
            var chart = $(ev.currentTarget);
            var sd = {
                global: chart.hasClass('global-stats'),
                user: chart.hasClass('user-stats'),
                stats: chart.hasClass('global-stats')? this.globalBags():this.userBags()
                }
            this.statsDisplay(sd);
            },

        
        
    }


    function validate(mmBag) {
        var val = new module.exports.MmBagVal();

        return val.validate(mmBag);
    }

    $(".stats-bar").hover(function(e){
        vm.showStatsPopup(e);
        var p =$(this).position();
        var w = $(this).width();
        
        $sp = $("#statsPopup");
        var sw = $sp.width();
        var sh = $sp.height();
        
        $sp.css({'top':(p.top - sh ) + 'px', 'left':(p.left + (w/2) - (sw/2)) + 'px'}).fadeIn();
        
        }, 
        function(e){
            $("#statsPopup").clearQueue().hide();
            //$("#statsPopup").fadeOut();
            });


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