/*
    CalendarProxy jQuery plugin
    MIT Licence - Charles Knight - 2014

    This grabs data from public Google Calendars' RSS feeds and returns the data as JSON.
    Thanks to the http://wki.pe/Same_Origin_Policy I had to make a proxy to handle the requests,
    so it goes ahead and parses the data as well. See https://github.com/rabidaudio/js-calendar-proxy
    Give it the [XML] link from the calendar's settings menu, an optional object with the
    parameters below, and a callback function with a single argument (the data) which will
    either be an array of event objects or a string with an error message. This module also
    has some useful natural language date format functions, which have been exposed as well.
    
    
    $.CalendarProxy.get_calendar(url, options, callback)
    
    options:
        start:      Date formatted with .toISOString() or "today" (defaults to today)
        end:        Date formatted with .toISOString() or "today" (defaults to 2 weeks from now)
        all:        "true" include hidden and deleted items. defaults to "false"
        orderby:    "lastmodified" or "starttime" (default starttime)
        sortorder:  "ascending" or "descending" (default ascending)


    Here's what an event object looks like:
{
    atom_link: "https://www.google.com/calendar/feeds/orpm6td3rsutl3972oosf4ksds%40group.calendar.google.com/public/full-noattendees/kagfmlrq3besde6fc7h4jdqdrc",
    author: {
        email: "sameeraomar@gmail.com",
        name: "Sameera Omar"
    },
    category: "http://schemas.google.com/g/2005#event",
    end: "2014-02-12T18:00:00.000-05:00",
    html_link: "https://www.google.com/calendar/event?eid=a2FnZm1scnEzYmVzZGU2ZmM3aDRqZHFkcmNfMjAxMzEwMDlUMjEwMDAwWiBvcnBtNnRkM3JzdXRsMzk3Mm9vc2Y0a3Nkc0Bn",
    id: "http://www.google.com/calendar/feeds/orpm6td3rsutl3972oosf4ksds%40group.calendar.google.com/public/full-noattendees/kagfmlrq3besde6fc7h4jdqdrc",
    published: "2013-10-05T22:42:41.000Z",
    start: "2014-02-12T17:00:00.000-05:00",
    status: "confirmed",
    title: "STARTUP CHICKS Meeting",
    uid: "kagfmlrq3besde6fc7h4jdqdrc@google.com",
    updated: "2013-10-05T22:42:41.000Z",
    where: "Startup Exchange"
}
*/
(function ($) {
    if($===undefined){
        throw new Error("Error: jQuery is required to use this module");
        return;
    }
    var module={};
    module.PROXY_URL = "http://calendar-proxy.herokuapp.com";
    module.GOOGLE_PATH = "/google";
    module.get_calendar = function(url, options, callback){
        var cb = (typeof callback == 'function') ? callback : new Function(callback);
        querystring="";
        if( options == undefined )          options={};
        if(options.start    != undefined)   querystring=querystring+ "&start="     +encodeURIComponent(options.start);
        if(options.end      != undefined)   querystring=querystring+ "&end="       +encodeURIComponent(options.end);
        if(options.all      != undefined)   querystring=querystring+ "&all="       +encodeURIComponent(options.all);
        if(options.orderby  != undefined)   querystring=querystring+ "&orderby="   +encodeURIComponent(options.orderby);
        if(options.sortorder!= undefined)   querystring=querystring+ "&sortorder=" +encodeURIComponent(options.sortorder);
        
        var results;
        $.ajax( module.PROXY_URL+module.GOOGLE_PATH+"?"+"url="+ encodeURIComponent(url)+querystring )
            .done(function(data){
                results = data;
            })
            .fail(function(xhr, textstatus, errorThrown){
                console.log("Calendar request failed");
                results = errorThrown;
            })
            .always(function(){
                    setTimeout(cb, 0, results);
            });
    }
    module.pretty_time = function(d){
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var ampm = "am";
        if( hours == 0 ){
            hours = 12;
        }else if(hours == 12){
            ampm="pm";
        }else if(hours>12){
            hours = hours % 12;
            ampm = "pm";
        }
        if( hours==12 && minutes==0 ) return (ampm=="am" ? "midnight" : "noon");
        return hours+( minutes != 0 ? ":"+(minutes<10?"0":"")+minutes : "" )+" "+ampm;
    }
    module.pretty_date = function(d){
        var today = new Date();
        var one_day = 1000*60*60*24;
        var diff = Math.ceil(d.getTime() - today.getTime())/one_day;
        if(diff==-1)                return "Yesterday at "+module.pretty_time(d);
        else if(diff==0)            return "Today at "+module.pretty_time(d);
        else if(diff==1)            return "Tomorrow at"+module.pretty_time(d);
        else if(diff<0 && diff>-7)  return "Last "+module.day_to_string(d.getDay())+" at "+module.pretty_time(d);
        else if(diff>0 && diff<7)   return "This "+module.day_to_string(d.getDay())+" at "+module.pretty_time(d);
        else if(diff>=7 && diff<14) return "Next "+module.day_to_string(d.getDay())+
                                                " the "+module.number_endings(d.getDate())+" at "+module.pretty_time(d);
        else                        return module.month_to_string(d.getMonth())+" "+
                                                module.number_endings(d.getDate())+" at "+module.pretty_time(d);
    }

    module.number_endings = function(n){
        switch(n%10){
            case 1:  return n+"st"; break;
            case 2:  return n+"nd"; break;
            case 3:  return n+"rd"; break;
            default: return n+"th";
        }
    }
    
    module.day_to_string = function(d){
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return days[d];
    }

    module.month_to_string = function(m){
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return months[m];
    }
    
    $.CalendarProxy = module;
}(jQuery));
