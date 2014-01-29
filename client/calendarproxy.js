var PROXY_URL = "http://calendar-proxy.herokuapp.com";
var GOOGLE_PATH = "/google";

function get_calendars(urls, callback){
    var cb = (typeof callback == 'function') ? callback : new Function(callback);
    var results = [];
    for(var i=0; i<urls.length;i++){
        $.ajax( PROXY_URL+GOOGLE_PATH+"?"+"url="+ encodeURIComponent(urls[i]))
            .done(function(data){
                //console.log(data);
                results.push(data);
            })
            .fail(function(xhr, textstatus, errorThrown){
                console.log("Calendar request "+i+" failed");
                results.push(errorThrown);
            })
            .always(function(){
                    console.log(results);
                    console.log("executing callback");
                    cb(results);
            });
    }
}
