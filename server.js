var express = require('express');
var app = express();

var calendarparse = require('./calendarparse.js');

app.get('/google', function(req, res){
    if(!req.query.url){
        console.log(req.query);
        res.set({'Access-Control-Allow-Origin': "*"});
        res.jsonp("Error: no URL provided");
    }else{
        console.log("["+(req.ip||"unknown addr")+"]Request recieved: "+req.query.url);
        calendarparse(req.query.url, req.query, function(events, errors){
            res.set({'Access-Control-Allow-Origin': "*"});
            if(errors){
                res.jsonp(errors);
            }else{
                res.jsonp(events);
            }
        });
    }
});

app.all('*', function(req, res){
    console.log("Invalid URL request: "+req.originalUrl);
    res.set({'Access-Control-Allow-Origin': "*"});
    res.jsonp(404, "Use /google to read Google Calendars");
});

app.listen(8888);
console.log("Server running");
