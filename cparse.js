
module.exports = function($, cb){

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
      /*console.log("A:    "+ $(this).find('author').html() );
        console.log("At:   "+ $(this).find('author').text() );
        console.log("A>N:  "+ $(this).find('author > name').html() );
        console.log("A>Nt: "+ $(this).find('author > name').text() );
        console.log("NAME  "+ $(this).find('name').html() );
        console.log("NAMEt "+ $(this).find('name').text() );
        console.log("Afn   "+ $(this).find('author').find('name').html() );
        console.log("Afnt  "+ $(this).find('author').find('name').text() );*/
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
                email:      $(this).find('email').text(),
                name:       ($(this).find('name').text()==$(this).find('email').text()
                                ? undefined
                                : $(this).find('name').text() )
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
};