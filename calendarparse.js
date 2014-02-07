var jsdom = require("jsdom");
var url = require("url");

function chomp(raw_text)
{
  return raw_text.replace(/(\n|\r)+$/, '');
}

module.exports = function(calendar, options, callback){
    /* Takes in the RSS/ATOM url for the Google Calendar and a callback function
    with a list of event objects as the first argument.
    example url: https://www.google.com/calendar/feeds/orpm6td3rsutl3972oosf4ksds%40group.calendar.google.com/public/full-noattendees
    You can include query string options in your url. However, the options object takes precedence, so
    use them for things I haven't included yet.
        https://developers.google.com/google-apps/calendar/v2/reference
    
    options:
        start:      JSONified date to start looking for events. defaults to today
        end:        upper limit to look for events. defaults to 2 weeks from now
        all:        include hidden and deleted items. defaults to false
        orderby:    lastmodified, starttime (default starttime)
        sortorder:  ascending,ascend,a,descending,descend,d (default ascending)
    */
    
    //Validate URL
    var cal_url = url.parse(calendar, true);
    var cb = (typeof callback == 'function') ? callback : new Function(callback);
    //if( !( /^https?:\/\/www.google.com\/calendar\/feeds/.test(calendar) ) ){
    if(     !(/^https?:$/.test(cal_url.protocol)) ||
            !(/google\.com$/.test(cal_url.hostname)) ||
            !(/^\/calendar\/feeds\//.test(cal_url.pathname)) ){
        console.log("Not a google calendar: " + calendar);
        cb([], "Not a valid Google Calendar URL");
        return;
    }
    if( /\/basic$/.test(cal_url.pathname) )
        cal_url.pathname = cal_url.pathname.replace(/\/basic$/,"/full-noattendees");
    
    //Prepare query string
    if( !options ) options = {};
    if( !options.start ) options.start = "today";
    //assume 2 weeks
    if( !options.end ) options.end = new Date((new Date()).getTime() + 2*7*24*60*60*1000).toISOString();
    if(options.start == "today") options.start = new Date().toISOString();
    if(options.end   == "today") options.end   = new Date().toISOString();
    if( options.start && !!Date.parse(options.start) ){
        cal_url.query['start-min'] = options.start;
        cal_url.query['recurrence-expansion-start'] = options.start;
    }   
    if( options.end && !!Date.parse(options.end) ) cal_url.query['start-max'] = options.end;
    if( options.all == 'true' || options.all == true){
        cal_url.query['showdeleted'] = 'true';
        cal_url.query['showhidden'] = 'true';   
    }
    if(options.sortorder && /^[ad]/i.test(options.sortorder)){
        cal_url.query['sortorder'] = options.sortorder.substr(0,1);
    }else{
        cal_url.query['sortorder'] = "ascending";
    }
    if(options.orderby == 'lastmodified'){
        cal_url.query['orderby'] = "lastmodified";
    }else{
        cal_url.query['orderby'] = "starttime";
    }
    calendar = url.format(cal_url);
    
    //get data
    var events = [];
    jsdom.env({ url: calendar,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function(errors, window){
            if(errors){
                console.log(errors);
                cb([], errors);
                return;
            }
            var $ = window.$;
            
            $.fn.imtext = function() {
            //http://viralpatel.net/blogs/jquery-get-text-element-without-child-element/
                return $(this)
                    .clone()
                    .children()
                    .remove()
                    .end()
                    .text();
            };
            
            //console.log( $('entry:first updated').text() );
            $('entry').each(function(event_index){
                //console.log( $(this).find('author').html() );
                //console.log( $(this).find('author > name').html() );
                var event = {
                    id:             $(this).find('id').text(),
                    published:      $(this).find('published').text(),
                    updated:        $(this).find('published').text(),
                    category:       $(this).find('category').attr('term'),
                    title:          $(this).find('title').text(),
                    
                    content_type:   $(this).find('content').attr('type'),
                    content:        chomp($(this).find('content').imtext()),
                    
                    html_link:      $(this).find("link[type='text/html']").attr('href'),
                    atom_link:      $(this).find("link[type='application/atom+xml']").attr('href'),
                    
                    author: {
                        name:       $(this).find('author').text().split("\n")[0];
                            //TODO Heroku doesn't like this. I have no idea why.
                                //$(this).find('author > name').text(),
                        email:      ($(this).find('author').text().split("\n")[1] || "");
                                //$(this).find('author > email').text()
                    },
                    
                    status:         $(this).find('gd\\:eventStatus').attr('value').match(/\.[a-z]*$/)[0].substr(1),
                    where:          $(this).find('gd\\:where').attr('valueString'),
                    uid:            $(this).find('gCal\\:uid').attr('value'),
                };
                //add an event for each occurrence
                $(this).find('gd\\:where > gd\\:when').each(function(i){
                    //console.log("For "+event.uid);
                    //console.log($(this).html());
                    event.start = $(this).attr('startTime');
                    event.end = $(this).attr('endTime');
                    events.push(event);
                });
            });
            cb(events, errors);  
        } 
    });
}



