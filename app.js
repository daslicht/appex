﻿var appex   = require('appex');

var runtime = appex.runtime ({

    source   : './program.ts', // location of 

    devmode  : true
});

require('http').createServer( function(request, response) {
    
    runtime(request, response);
    
}).listen(5444);
