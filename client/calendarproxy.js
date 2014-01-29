var PROXY_URL = "http://calendar-proxy.herokuapp.com";
var GOOGLE_PATH = "/google";
/*
    options:
        start:      JSONified date to start looking for events. defaults to today
        end:        upper limit to look for events. defaults to 2 weeks from now
        all:        include hidden and deleted items. defaults to false
        orderby:    lastmodified, starttime (default starttime)
        sortorder:  ascending,ascend,a,descending,descend,d (default ascending)
*/
function get_calendars(urls, options, callback){
    var cb = (typeof callback == 'function') ? callback : new Function(callback);
    querystring="";
    if(options.start    != undefined)   querystring=querystring+ "&start="     +encodeURIComponent((new Date(options.start)).toISOString());
    if(options.end      != undefined)   querystring=querystring+ "&end="       +encodeURIComponent((new Date(options.end)).toISOString());
    if(options.all      != undefined)   querystring=querystring+ "&all="       +encodeURIComponent(options.all);
    if(options.orderby  != undefined)   querystring=querystring+ "&orderby="   +encodeURIComponent(options.orderby);
    if(options.sortorder!= undefined)   querystring=querystring+ "&sortorder=" +encodeURIComponent(options.sortorder);
    
    //console.log( PROXY_URL+GOOGLE_PATH+"?"+"url="+ encodeURIComponent(urls[0])+querystring );
    var results = [];
    for(var i=0; i<urls.length;i++){
        $.ajax( PROXY_URL+GOOGLE_PATH+"?"+"url="+ encodeURIComponent(urls[i])+querystring)
            .done(function(data){
                //console.log(data);
                results.push(data);
            })
            .fail(function(xhr, textstatus, errorThrown){
                console.log("Calendar request "+i+" failed");
                results.push(errorThrown);
            })
            .always(function(){
                    cb(results);
            });
    }
}
