var PROXY_URL = "http://calendar-proxy.herokuapp.com";
var GOOGLE_PATH = "/google";
/*
    This grabs data from public Google Calendars' RSS feeds and returns the data as JSON.
    Thanks to the wki.pe/Same_Origin_Policy I had to make a proxy to handle the requests,
    so it goes ahead and parses the data as well. See https://github.com/rabidaudio/js-calendar-proxy
    Give it the [XML] link from the calendar's settings menu, an optional object with the
    parameters below, and a callback function with a single argument (the data) which will
    either be an array of event objects or a string with an error message.
    Charles Knight - 2014
    
    options:
        start:      Date formatted with .toISOString() or "today" (defaults to today)
        end:        Date formatted with .toISOString() or "today" (defaults to 2 weeks from now)
        all:        "true" include hidden and deleted items. defaults to "false"
        orderby:    "lastmodified" or "starttime" (default starttime)
        sortorder:  "ascending" or "descending" (default ascending)
*/
function get_calendar(url, options, callback){
    var cb = (typeof callback == 'function') ? callback : new Function(callback);
    querystring="";
    if( options == undefined )          options={};
    if(options.start    != undefined)   querystring=querystring+ "&start="     +encodeURIComponent(options.start);
    if(options.end      != undefined)   querystring=querystring+ "&end="       +encodeURIComponent(options.end);
    if(options.all      != undefined)   querystring=querystring+ "&all="       +encodeURIComponent(options.all);
    if(options.orderby  != undefined)   querystring=querystring+ "&orderby="   +encodeURIComponent(options.orderby);
    if(options.sortorder!= undefined)   querystring=querystring+ "&sortorder=" +encodeURIComponent(options.sortorder);
    
    //console.log( PROXY_URL+GOOGLE_PATH+"?"+"url="+ encodeURIComponent(url)+querystring );
    var results;
    $.ajax( PROXY_URL+GOOGLE_PATH+"?"+"url="+ encodeURIComponent(url)+querystring )
        .done(function(data){
            //console.log(data);
            results = data;
        })
        .fail(function(xhr, textstatus, errorThrown){
            console.log("Calendar request failed");
            results = errorThrown;
        })
        .always(function(){
                cb(results);
        });
}
